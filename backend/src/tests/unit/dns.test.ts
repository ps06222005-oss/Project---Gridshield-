/**
 * unit/dns.test.ts — Unit tests for MongoDB Atlas DNS configuration and SRV resolution.
 */
import { describe, it, expect } from 'vitest';
import dns from 'dns';
import { extractMongoHostname, configureDnsForMongo } from '../../config/db';

describe('MongoDB DNS Resolution & Hostname Extraction', () => {
  it('extracts cluster hostname cleanly from mongodb+srv URI', () => {
    const host = extractMongoHostname(
      'mongodb+srv://testuser:secretpass@cluster0.3eaaecy.mongodb.net/gridshield?retryWrites=true&w=majority'
    );
    expect(host).toBe('cluster0.3eaaecy.mongodb.net');
  });

  it('extracts cluster hostname from URI without trailing path', () => {
    const host = extractMongoHostname(
      'mongodb+srv://testuser:secretpass@cluster0.3eaaecy.mongodb.net/'
    );
    expect(host).toBe('cluster0.3eaaecy.mongodb.net');
  });

  it('extracts cluster hostname from URI with special characters in credentials', () => {
    const host = extractMongoHostname(
      'mongodb+srv://my%40user:p%40ssword123@my-cluster.mongodb.net/db'
    );
    expect(host).toBe('my-cluster.mongodb.net');
  });

  it('returns null or empty for invalid URI without host', () => {
    const host = extractMongoHostname('not-a-valid-uri');
    expect(host).toBeNull();
  });

  it('skips SRV DNS resolution for standard mongodb:// URIs', async () => {
    // Should resolve without error or attempting SRV resolution
    await expect(
      configureDnsForMongo('mongodb://127.0.0.1:27017/test_db')
    ).resolves.toBeUndefined();
  });

  it('resolves actual SRV records for cluster0.3eaaecy.mongodb.net using fallback DNS', async () => {
    // Force loopback to simulate Windows/Node.js c-ares loopback bug
    dns.setServers(['127.0.0.1']);
    expect(dns.getServers()).toEqual(['127.0.0.1']);

    // configureDnsForMongo should detect failure on loopback and auto-fallback to Cloudflare/Google DNS
    await configureDnsForMongo(
      'mongodb+srv://dummy:dummy@cluster0.3eaaecy.mongodb.net/test'
    );

    // DNS servers should now be updated to a working fallback (e.g. 1.1.1.1)
    const activeServers = dns.getServers();
    expect(activeServers).not.toEqual(['127.0.0.1']);
    expect(activeServers.length).toBeGreaterThan(0);

    // Verify SRV record resolution works now
    const records = await dns.promises.resolveSrv('_mongodb._tcp.cluster0.3eaaecy.mongodb.net');
    expect(records.length).toBe(3);
    for (const r of records) {
      expect(r.name).toContain('3eaaecy.mongodb.net');
      expect(r.port).toBe(27017);
    }
  });
});
