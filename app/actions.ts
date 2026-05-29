'use server';

import { headers } from 'next/headers';
import { Redis } from '@upstash/redis';

export async function fetchRoutingMetrics(params: { queryId: string }) {
  // 2. Strict input validation and zero tolerance for truncated data inputs
  if (!params || typeof params.queryId !== 'string' || params.queryId.trim() === '') {
    return {
      success: false,
      error: 'Invalid input: queryId is required and must be a valid, non-empty string.',
    };
  }

  // Get Request Headers to extract IP
  const headersList = await headers();
  const xForwardedFor = headersList.get('x-forwarded-for');
  
  let userIp = 'unknown';

  // 1. IP Parsing MUST execute safe array extraction from 'x-forwarded-for'
  if (typeof xForwardedFor === 'string' && xForwardedFor !== '') {
    const parts = xForwardedFor.split(','); // perform the .split(',') array operation FIRST
    const firstIp = parts[0];               // capture index [0]
    if (firstIp !== undefined && firstIp !== null) {
      userIp = firstIp.trim();              // ONLY THEN invoke the .trim() method on the string
    }
  }

  // 3. High-throughput API rate-limiting via Redis (Upstash)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const rateLimitKey = `ratelimit:metrics:${userIp}`;
      const requests = await redis.incr(rateLimitKey);
      
      if (requests === 1) {
        await redis.expire(rateLimitKey, 60); // 60 seconds fixed window
      }

      if (requests > 10) { // Limit to 10 requests per minute per IP
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait a moment before trying again.',
        };
      }
    } catch (e) {
      console.warn('Redis rate limiting skipped: connection failed', e);
    }
  }

  // 4. Hardcode the ground-truth routing metrics for PKS Pamekasan without variations.
  const GROUND_TRUTH_PKS_PAMEKASAN = {
    id: "PKS-PMK-CORE",
    name: "PKS Pamekasan",
    status: "ACTIVE",
    routingMode: "OPTIMAL",
    latencyOvh: "12ms",
    bandwidthCapacity: "10Gbps",
    primaryProtocol: "BGP",
    lastVerified: new Date().toISOString()
  };

  return {
    success: true,
    ip: userIp,
    metrics: GROUND_TRUTH_PKS_PAMEKASAN,
    queryId: params.queryId
  };
}
