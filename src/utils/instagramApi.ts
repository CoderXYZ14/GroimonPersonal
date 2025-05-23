import axios from "axios";
import { getCache, setCache } from "@/lib/redis";

const ALL_FIELDS = "id,username,account_type,media_count,profile_picture_url";

export async function fetchInstagramUserDetails(
  accessToken: string,
  fields: string = "id,username"
) {
  const tokenPrefix = accessToken.substring(0, 10);
  const requestedFields = fields.split(",");

  // Check full cache first
  const fullCacheKey = `instagram:user:${tokenPrefix}:full`;
  const fullCached = await getCache(fullCacheKey);

  if (fullCached) {
    const filtered = {};
    requestedFields.forEach(
      (f) => fullCached[f] !== undefined && (filtered[f] = fullCached[f])
    );
    if (Object.keys(filtered).length === requestedFields.length)
      return filtered;
  }

  // Check specific cache
  const specificCacheKey = `instagram:user:${tokenPrefix}:${fields}`;
  const specificCached = await getCache(specificCacheKey);
  if (specificCached) return specificCached;

  // Fetch from API
  const fieldsToRequest = requestedFields.length >= 3 ? ALL_FIELDS : fields;
  const { data } = await axios.get(`https://graph.instagram.com/me`, {
    params: { fields: fieldsToRequest, access_token: accessToken },
  });

  // Cache responses
  if (fieldsToRequest === ALL_FIELDS) {
    await setCache(fullCacheKey, data, 1800);
  }

  const result =
    fieldsToRequest === fields
      ? data
      : requestedFields.reduce(
          (acc, f) => (data[f] !== undefined && (acc[f] = data[f]), acc),
          {}
        );

  await setCache(specificCacheKey, result, 1800);
  return result;
}
