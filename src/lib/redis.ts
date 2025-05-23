import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "");
const TTL = 1200;

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis get error:", err);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = TTL
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (err) {
    console.error("Redis set error:", err);
  }
}

export async function delCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis delete error:", err);
  }
}

export async function removeItemFromCachedCollection<T>(
  key: string,
  idToRemove: string,
  idField: string = "_id"
): Promise<boolean> {
  try {
    const cachedCollection = await getCache<T[]>(key);
    if (!cachedCollection) return false;

    const updatedCollection = cachedCollection.filter(
      (item) => item[idField] !== idToRemove
    );
    if (updatedCollection.length === cachedCollection.length) return false;

    await setCache(key, updatedCollection);
    return true;
  } catch (err) {
    console.error("Redis removeItemFromCachedCollection error:", err);
    return false;
  }
}
