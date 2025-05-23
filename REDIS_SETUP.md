# Redis Setup for ChatoMeta

## Environment Variables

Add the following environment variable to your `.env.local` file:

```
REDIS_URL=rediss://default:your_password@your-instance.upstash.io:6379
```

Replace `your_password` and `your-instance.upstash.io` with your actual Upstash Redis credentials.

## How It Works

The stats API uses Redis caching with a 20-minute TTL (Time To Live). This means that the stats data will be cached for 20 minutes before being refreshed. This significantly reduces database load and improves API response times.

## Cache Keys

The cache keys follow this format:
- `stats:{userId}:{statType}`

Where:
- `userId` is the MongoDB ID of the user
- `statType` is one of: `all`, `hits`, `redirects`, or `count`

## Vercel Deployment

When deploying to Vercel, add the `REDIS_URL` environment variable in your Vercel project settings.

## Cache Invalidation

If you need to manually invalidate the cache after updating data, you can use the `invalidateCache` function:

```typescript
import { invalidateCache } from "@/lib/redis";

// Invalidate all stats for a specific user
await invalidateCache(`stats:${userId}:*`);

// Invalidate a specific stat type for a user
await invalidateCache(`stats:${userId}:all`);
```
