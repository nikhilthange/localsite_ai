import config from '../../config';

export class CloudflareConfig {
  static getApiUrl(): string {
    return 'https://api.cloudflare.com/client/v4';
  }

  static getHeaders(): Record<string, string> {
    return {
      'Authorization': 'Bearer ' + config.cloudflare.apiToken,
      'Content-Type': 'application/json',
    };
  }

  static getZoneId(): string {
    return config.cloudflare.zoneId;
  }

  static getDomain(): string {
    return config.cloudflare.domain;
  }

  static getR2Endpoint(): string {
    if (config.cloudflare.accountId) {
      return 'https://' + config.cloudflare.accountId + '.r2.cloudflarestorage.com';
    }
    return '';
  }

  static getPublicUrl(key: string): string {
    if (config.cloudflare.domain) {
      return 'https://' + config.cloudflare.domain + '/' + key;
    }
    return '';
  }

  static isConfigured(): boolean {
    return !!(config.cloudflare.apiToken && config.cloudflare.zoneId);
  }

  static async createDNSRecord(name: string, content: string, type: 'A' | 'CNAME' = 'CNAME'): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const response = await fetch(this.getApiUrl() + '/zones/' + this.getZoneId() + '/dns_records', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type,
          name,
          content,
          ttl: 120,
          proxied: true,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  static async purgeCache(urls: string[]): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const response = await fetch(this.getApiUrl() + '/zones/' + this.getZoneId() + '/purge_cache', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ files: urls }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  static async enableSSL(hostname: string): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const response = await fetch(this.getApiUrl() + '/zones/' + this.getZoneId() + '/ssl/universal/settings', {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ enabled: true }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
