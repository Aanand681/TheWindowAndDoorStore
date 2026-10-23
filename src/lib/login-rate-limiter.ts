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

export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  minutesRemaining?: number;
  attemptsRemaining?: number;
} {
  cleanExpired();
  const key = identifier.toLowerCase().trim();
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

export function recordFailedLogin(identifier: string): {
  isLocked: boolean;
  minutesRemaining?: number;
  attemptsRemaining: number;
} {
  cleanExpired();
  const key = identifier.toLowerCase().trim();
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

export function resetLoginAttempts(identifier: string) {
  const key = identifier.toLowerCase().trim();
  attemptsMap.delete(key);
}
