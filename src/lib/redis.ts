import Redis from 'ioredis';

class RedisManager {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private readonly fallbackMemoryCache: Record<string, { value: any; expiry: number }> = {};

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      try {
        this.client = new Redis(url, {
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => {
            if (times > 3) return null; // stop retrying
            return Math.min(times * 50, 2000);
          }
        });

        this.client.on('connect', () => {
          this.isConnected = true;
          console.log('[Redis] Connected to Redis cache');
        });

        this.client.on('error', (err) => {
          console.error('[Redis] Connection Error:', err.message);
          this.isConnected = false;
        });

      } catch (err) {
        console.error('[Redis] Failed to initialize client:', err);
      }
    } else {
      console.warn('[Redis] REDIS_URL not provided. Using in-memory fallback cache.');
    }
  }

  /**
   * Set a key-value pair in the cache with an expiration time in seconds.
   */
  async set(key: string, value: any, ttlSeconds: number = 86400): Promise<void> {
    const stringValue = JSON.stringify(value);
    
    if (this.client && this.isConnected) {
      try {
        await this.client.set(key, stringValue, 'EX', ttlSeconds);
        return;
      } catch (err) {
        console.error(`[Redis] Failed to set key ${key}:`, err);
        // Fallthrough to memory cache
      }
    }
    
    // In-memory fallback
    this.fallbackMemoryCache[key] = {
      value: stringValue,
      expiry: Date.now() + (ttlSeconds * 1000)
    };
  }

  /**
   * Get a value from the cache.
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.client && this.isConnected) {
      try {
        const val = await this.client.get(key);
        if (val) return JSON.parse(val) as T;
      } catch (err) {
        console.error(`[Redis] Failed to get key ${key}:`, err);
        // Fallthrough to memory cache
      }
    }

    // In-memory fallback
    const memCache = this.fallbackMemoryCache[key];
    if (memCache) {
      if (Date.now() < memCache.expiry) {
        return JSON.parse(memCache.value) as T;
      } else {
        delete this.fallbackMemoryCache[key];
      }
    }
    return null;
  }

  /**
   * Retrieves short term memory files for a user
   */
  async getUserFiles(userId: string | number): Promise<{name: string, content: string}[]> {
    const files: {name: string, content: string}[] = [];
    const prefix = `user_file_${userId}_`;
    
    if (this.client && this.isConnected) {
      try {
        const keys = await this.client.keys(`${prefix}*`);
        for (const key of keys) {
           const val = await this.get<{name: string, content: string}>(key);
           if (val) files.push(val);
        }
        return files;
      } catch (err) {
        console.error(`[Redis] Failed to get user files:`, err);
      }
    }

    // In-memory fallback
    for (const key in this.fallbackMemoryCache) {
      if (key.startsWith(prefix)) {
        const memCache = this.fallbackMemoryCache[key];
        if (Date.now() < memCache.expiry) {
          files.push(JSON.parse(memCache.value));
        } else {
          delete this.fallbackMemoryCache[key];
        }
      }
    }
    return files;
  }
  async del(key: string): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        console.error(`[Redis] Failed to delete key ${key}:`, err);
        // Fallthrough to memory cache
      }
    }
    delete this.fallbackMemoryCache[key];
  }

  /**
   * Rate limiting feature: increments a key and sets expiry if it's new.
   * Returns the current count.
   */
  async incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
    if (this.client && this.isConnected) {
      try {
        const current = await this.client.incr(key);
        if (current === 1) {
          await this.client.expire(key, windowSeconds);
        }
        return current;
      } catch (err) {
        console.error(`[Redis] Rate limit incr error:`, err);
      }
    }

    // Fallback logic
    const memCache = this.fallbackMemoryCache[key];
    if (memCache && Date.now() < memCache.expiry) {
      const current = parseInt(memCache.value, 10) + 1;
      memCache.value = JSON.stringify(current);
      return current;
    } else {
      this.fallbackMemoryCache[key] = {
        value: "1",
        expiry: Date.now() + (windowSeconds * 1000)
      };
      return 1;
    }
  }
}

export const redisCache = new RedisManager();
