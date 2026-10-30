/**
 * db.ts — MongoDB Atlas connection via Mongoose.
 * Includes intelligent DNS resolution for MongoDB Atlas SRV connection strings.
 */
import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env';

let isConnected = false;

// Standard public DNS resolver tiers for fallback when system resolver fails
const FALLBACK_DNS_TIERS = [
  { name: 'Cloudflare DNS', servers: ['1.1.1.1', '1.0.0.1'] },
  { name: 'Google DNS', servers: ['8.8.8.8', '8.8.4.4'] },
  { name: 'Quad9 DNS', servers: ['9.9.9.9', '149.112.112.112'] },
];

/**
 * Safely extracts only the hostname from a MongoDB connection string.
 * Never exposes credentials or query parameters in logs.
 */
export function extractMongoHostname(uri: string): string | null {
  try {
    const parsed = new URL(uri);
    return parsed.hostname;
  } catch {
    const match = uri.match(/@([^/?#:]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Configures Node.js DNS resolution for MongoDB Atlas SRV records.
 * Resolves querySrv ECONNREFUSED issues on platforms where Node.js c-ares
 * defaults to loopback (127.0.0.1) or where local routers refuse SRV queries.
 */
export async function configureDnsForMongo(uri: string): Promise<void> {
  // Only mongodb+srv:// connection strings require SRV DNS resolution
  if (!uri.startsWith('mongodb+srv://')) {
    return;
  }

  const hostname = extractMongoHostname(uri);
  if (!hostname) {
    console.warn('[db] Could not extract cluster hostname from MONGODB_URI for DNS check.');
    return;
  }

  const srvRecord = `_mongodb._tcp.${hostname}`;

  // Option 1: User explicitly configured DNS_SERVERS in .env
  if (ENV.DNS_SERVERS && ENV.DNS_SERVERS.trim().length > 0) {
    const customServers = ENV.DNS_SERVERS.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (customServers.length > 0) {
      console.log(`[db] Using user-configured DNS servers: [${customServers.join(', ')}]`);
      dns.setServers(customServers);
      try {
        const records = await dns.promises.resolveSrv(srvRecord);
        console.log(`[db] SRV resolution successful (${records.length} records found) via configured DNS.`);
        return;
      } catch (err: any) {
        console.warn(`[db] Configured DNS servers failed to resolve ${srvRecord}: ${err.message}`);
      }
    }
  }

  // Option 2: Test system default DNS servers first
  const systemServers = dns.getServers();
  const isLoopbackOnly =
    systemServers.length === 1 && (systemServers[0] === '127.0.0.1' || systemServers[0] === '::1');

  if (!isLoopbackOnly) {
    try {
      const records = await dns.promises.resolveSrv(srvRecord);
      if (records && records.length > 0) {
        console.log(`[db] SRV resolution verified using system DNS [${systemServers.join(', ')}].`);
        return;
      }
    } catch (err: any) {
      console.warn(
        `[db] System DNS [${systemServers.join(', ')}] failed to resolve ${srvRecord}: ${err.code || err.message}`
      );
    }
  } else {
    console.warn(
      `[db] Node.js default DNS is loopback [${systemServers.join(', ')}]. Local DNS resolver likely absent.`
    );
  }

  // Option 3: Automatically fallback through reliable DNS resolver tiers
  for (const tier of FALLBACK_DNS_TIERS) {
    try {
      dns.setServers(tier.servers);
      const records = await dns.promises.resolveSrv(srvRecord);
      if (records && records.length > 0) {
        console.log(
          `[db] Resolved MongoDB Atlas SRV records (${records.length} nodes) via ${tier.name} [${tier.servers.join(', ')}].`
        );
        return;
      }
    } catch (err: any) {
      // Try next tier
    }
  }

  // Option 4: All resolvers failed — emit clear, actionable diagnostic
  console.error('\n' + '='.repeat(70));
  console.error('[db] CRITICAL DNS RESOLUTION FAILURE FOR MONGODB ATLAS');
  console.error(`[db] Cluster: ${hostname}`);
  console.error(`[db] Tested DNS: System [${systemServers.join(', ')}] and public fallbacks.`);
  console.error('[db] Diagnostic Checklist:');
  console.error('  1. Check your internet connection.');
  console.error('  2. If behind a corporate firewall, proxy, or VPN, outbound UDP 53 to public DNS may be blocked.');
  console.error('  3. Set DNS_SERVERS=<your_network_dns_ip> in backend/.env to use your internal DNS server.');
  console.error('='.repeat(70) + '\n');

  throw new Error(`Failed to resolve MongoDB Atlas SRV record: ${srvRecord}`);
}

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  mongoose.set('strictQuery', true);

  // Configure and verify DNS resolution before initiating connection
  await configureDnsForMongo(ENV.MONGODB_URI);

  try {
    await mongoose.connect(ENV.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });

    isConnected = true;
    console.log('[db] Connected to MongoDB Atlas');

    mongoose.connection.on('error', (err) => {
      console.error('[db] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[db] MongoDB disconnected. Reconnecting...');
      isConnected = false;
    });
  } catch (err: any) {
    let underlyingError = '';
    if (err.reason && err.reason.servers) {
      for (const [addr, desc] of err.reason.servers) {
        if (desc.error && desc.error.message) {
          underlyingError += `\n   - Node ${addr}: ${desc.error.message}`;
        }
      }
    }

    console.error('[db] Failed to connect to MongoDB Atlas:', err.message || err);
    if (underlyingError) {
      console.error(`[db] Underlying node responses:${underlyingError}`);
    }

    const fullErrText = `${err.message || ''} ${underlyingError}`.toLowerCase();

    // Contextual diagnostic assistance
    if (fullErrText.includes('bad auth') || fullErrText.includes('authentication failed')) {
      console.error('\n' + '-'.repeat(70));
      console.error('[db] DIAGNOSTIC: Authentication failed for MongoDB Atlas.');
      console.error('[db] DNS SRV lookup and TCP handshakes succeeded, but Atlas rejected the credentials.');
      console.error('[db] Required Actions:');
      console.error('  1. In MongoDB Atlas, go to "Database Access" and check user "ps06222005_db_user".');
      console.error('  2. Click "Edit" -> "Edit Password" to reset or verify the password.');
      console.error('  3. Update MONGODB_URI in backend/.env with the exact matching password.');
      console.error('  4. If your password has special characters like @, #, $, or %, ensure they are URL-encoded.');
      console.error('-'.repeat(70) + '\n');
    } else if (fullErrText.includes('whitelist') || fullErrText.includes('could not connect to any servers')) {
      console.error('\n' + '-'.repeat(70));
      console.error('[db] DIAGNOSTIC: IP Access List restriction.');
      console.error('[db] Ensure your current IP is added to the Atlas Network Access whitelist (or 0.0.0.0/0).');
      console.error('-'.repeat(70) + '\n');
    }

    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('[db] Disconnected from MongoDB Atlas');
}
