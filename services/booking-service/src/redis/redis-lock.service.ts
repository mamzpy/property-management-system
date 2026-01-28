import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisLockService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Try to acquire a lock.
   * @returns true if acquired, false if already locked
   */
  async acquireLock(key: string, ttlMs: number): Promise<boolean> {
    const redis = this.redisService.getClient();

    // SET key value NX PX ttl
    const result = await redis.set(key, 'locked', 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    const redis = this.redisService.getClient();
    await redis.del(key);
  }
}
