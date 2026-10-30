/**
 * unit/dns.test.ts — Unit tests for MongoDB Atlas DNS configuration and SRV resolution.
 */
import { describe, it, expect } from 'vitest';
import dns from 'dns';
import dnsPromises from 'dns/promises';
import { extractMongoHostname, configureDnsForMongo } from '../../config/db';

describe('MongoDB DNS Resolution & Hostname Extraction', () => {
  it('extracts cluster hostname cleanly from mongodb+srv URI', () => {
    const host = extractMongoHostname(
      'mongodb+srv://sample-user:sample-password@cluster0.example.com/gridshield?retryWrites=true&w=majority'
    );
    expect(host).toBe('cluster0.example.com');
  });

  it('extracts cluster hostname from URI without trailing path', () => {
    const host = extractMongoHostname(
      'mongodb+srv://sample-user:sample-password@cluster0.example.com/'
    );
    expect(host).toBe('cluster0.example.com');
  });

  it('extracts cluster hostname from URI with special characters in credentials', () => {
    const host = extractMongoHostname(
      'mongodb+srv://sample%40user:p%40ssword123@my-cluster.example.org/db'
    );
    expect(host).toBe('my-cluster.example.org');
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

  it('detects loopback DNS and successfully falls back to public DNS tiers', async () => {
    // Save original resolver descriptor and servers
    const originalDescriptor = Object.getOwnPropertyDescriptor(dns, 'promises');
    const originalServers = dns.getServers();

    const mockResolver = async (hostname: string) => {
      const currentServers = dns.getServers();
      // Fail if called while only loopback is configured
      if (currentServers.includes('127.0.0.1') && currentServers.length === 1) {
        const err: any = new Error(`querySrv ECONNREFUSED ${hostname}`);
        err.code = 'ECONNREFUSED';
        throw err;
      }
      // Succeed once switched to public fallback resolvers
      return [
        { name: 'mock-shard-00-00.example.com', port: 27017, priority: 0, weight: 0 },
        { name: 'mock-shard-00-01.example.com', port: 27017, priority: 0, weight: 0 },
        { name: 'mock-shard-00-02.example.com', port: 27017, priority: 0, weight: 0 },
      ];
    };

    try {
      // Force loopback to simulate Windows/Node.js c-ares loopback bug
      dns.setServers(['127.0.0.1']);
      expect(dns.getServers()).toEqual(['127.0.0.1']);

      // Intercept dns.promises via getter proxy so that re-binding during dns.setServers keeps mock active
      Object.defineProperty(dns, 'promises', {
        get: () =>
          new Proxy(originalDescriptor?.get?.() ?? (dnsPromises as any), {
            get(target, prop) {
              if (prop === 'resolveSrv') return mockResolver;
              return (target as any)[prop];
            },
          }),
        configurable: true,
      });

      await configureDnsForMongo(
        'mongodb+srv://dummy-user:dummy-pass@mock-cluster.example.com/test'
      );

      // DNS servers should now be updated to a working fallback (e.g. 1.1.1.1)
      const activeServers = dns.getServers();
      expect(activeServers).not.toEqual(['127.0.0.1']);
      expect(activeServers.length).toBeGreaterThan(0);

      // Verify SRV record resolution works now
      const records = await dns.promises.resolveSrv('_mongodb._tcp.mock-cluster.example.com');
      expect(records.length).toBe(3);
      for (const r of records) {
        expect(r.port).toBe(27017);
      }
    } finally {
      // Restore original resolver descriptor and servers
      if (originalDescriptor) {
        Object.defineProperty(dns, 'promises', originalDescriptor);
      }
      dns.setServers(originalServers);
    }
  });
});
