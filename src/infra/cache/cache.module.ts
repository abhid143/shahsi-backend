import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true, // 🔥 important
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: '127.0.0.1', // 🔥 use IP instead of localhost
            port: 6379,
          },
        }),
        ttl: 60 * 1000, // 🔥 milliseconds (VERY IMPORTANT)
      }),
    }),
  ],
})
export class AppCacheModule {}