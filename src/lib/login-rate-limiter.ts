interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const attemptsMap = new Map<string, AttemptRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes timeout
const WINDOW_MS = 15 * 60 * 1000; // 15 minute sliding window

function cleanExpired() {
  const now = Date.now();
  for (const [key, record] of attemptsMap.entries()) {
    if (record.lockedUntil && record.lockedUntil < now) {
      attemptsMap.delete(key);
    } else if (now - record.lastAttempt > WINDOW_MS && !record.lockedUntil) {
      attemptsMap.delete(key);
    }
  }
}

export interface RateLimitTarget {
  identifier: string;
  clientIp?: string;
}

function normalizeKey(target: string | RateLimitTarget, type: 'user' | 'ip'): string {
  if (typeof target === 'string') {
    return target.toLowerCase().trim();
  }
  if (type === 'ip') {
    return (target.clientIp || '127.0.0.1').trim();
  }
  return (target.identifier || '').toLowerCase().trim();
}

function checkSingleTarget(key: string): { allowed: boolean; minutesRemaining?: number; attemptsRemaining: number } {
  cleanExpired();
  const record = attemptsMap.get(key);

  if (!record) {
    return { allowed: true, attemptsRemaining: MAX_FAILED_ATTEMPTS };
  }

  const now = Date.now();

  if (record.lockedUntil && record.lockedUntil > now) {
    const minutesRemaining = Math.max(1, Math.ceil((record.lockedUntil - now) / 60000));
    return {
      allowed: false,
      minutesRemaining,
      attemptsRemaining: 0,
    };
  }

  // If lockout expired, reset
  if (record.lockedUntil && record.lockedUntil <= now) {
    attemptsMap.delete(key);
    return { allowed: true, attemptsRemaining: MAX_FAILED_ATTEMPTS };
  }

  const attemptsRemaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return { allowed: true, attemptsRemaining };
}

export function checkLoginRateLimit(target: string | RateLimitTarget): {
  allowed: boolean;
  minutesRemaining?: number;
  attemptsRemaining?: number;
} {
  const userKey = normalizeKey(target, 'user');
  const ipKey = typeof target === 'object' && target.clientIp ? `ip:${normalizeKey(target, 'ip')}` : null;

  const userCheck = checkSingleTarget(`user:${userKey}`);
  if (!userCheck.allowed) {
    return userCheck;
  }

  if (ipKey) {
    const ipCheck = checkSingleTarget(ipKey);
    if (!ipCheck.allowed) {
      return ipCheck;
    }
    // Return the lowest remaining attempts between user and IP so changing username does not reset attempts
    return {
      allowed: true,
      attemptsRemaining: Math.min(userCheck.attemptsRemaining, ipCheck.attemptsRemaining),
    };
  }

  return userCheck;
}

function recordSingleFailure(key: string): { isLocked: boolean; minutesRemaining?: number; attemptsRemaining: number } {
  cleanExpired();
  const now = Date.now();
  let record = attemptsMap.get(key);

  if (!record || (now - record.lastAttempt > WINDOW_MS && !record.lockedUntil)) {
    record = { count: 0, lockedUntil: null, lastAttempt: now };
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    attemptsMap.set(key, record);
    return {
      isLocked: true,
      minutesRemaining: 15,
      attemptsRemaining: 0,
    };
  }

  attemptsMap.set(key, record);
  return {
    isLocked: false,
    attemptsRemaining: MAX_FAILED_ATTEMPTS - record.count,
  };
}

export function recordFailedLogin(target: string | RateLimitTarget): {
  isLocked: boolean;
  minutesRemaining?: number;
  attemptsRemaining: number;
} {
  const userKey = normalizeKey(target, 'user');
  const ipKey = typeof target === 'object' && target.clientIp ? `ip:${normalizeKey(target, 'ip')}` : null;

  const userRes = recordSingleFailure(`user:${userKey}`);

  if (ipKey) {
    const ipRes = recordSingleFailure(ipKey);
    const isLocked = userRes.isLocked || ipRes.isLocked;
    const minutesRemaining = Math.max(userRes.minutesRemaining || 0, ipRes.minutesRemaining || 0) || 15;
    const attemptsRemaining = Math.min(userRes.attemptsRemaining, ipRes.attemptsRemaining);

    return {
      isLocked,
      minutesRemaining: isLocked ? minutesRemaining : undefined,
      attemptsRemaining,
    };
  }

  return userRes;
}

export function resetLoginAttempts(target: string | RateLimitTarget) {
  const userKey = normalizeKey(target, 'user');
  attemptsMap.delete(`user:${userKey}`);

  // Note: on successful user authentication, we clear the user key
  // and decrement/reset the IP key if desired
  if (typeof target === 'object' && target.clientIp) {
    const ipKey = `ip:${normalizeKey(target, 'ip')}`;
    attemptsMap.delete(ipKey);
  }
}

