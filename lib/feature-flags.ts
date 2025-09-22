export type FeatureFlagName = 'enableTopBar';

type FeatureFlagState = Record<FeatureFlagName, boolean>;

const DEFAULT_FLAGS: FeatureFlagState = {
  enableTopBar: true,
};

const STORAGE_PREFIX = 'heyspex:feature-flag:';
const FLAG_EVENT = 'heyspex-feature-flag-change';

const TRUE_VALUES = new Set(['true', '1', 'on', 'enabled']);
const FALSE_VALUES = new Set(['false', '0', 'off', 'disabled']);

const toEnvKey = (flag: FeatureFlagName) =>
  `NEXT_PUBLIC_FLAG_${flag.replace(/([A-Z])/g, '_$1').toUpperCase()}`;

function parseBoolean(value: string | undefined | null): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) {
    return true;
  }
  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return undefined;
}

function getEnvOverride(flag: FeatureFlagName): boolean | undefined {
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return undefined;
  }

  const envKey = toEnvKey(flag);
  return parseBoolean(process.env[envKey]);
}

function storageKey(flag: FeatureFlagName) {
  return `${STORAGE_PREFIX}${flag}`;
}

function getStoredFlag(flag: FeatureFlagName): boolean | undefined {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return undefined;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey(flag));
    return parseBoolean(rawValue);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Unable to read feature flag "${flag}" from storage`, error);
    }
    return undefined;
  }
}

export function getFeatureFlag(flag: FeatureFlagName): boolean {
  const envOverride = getEnvOverride(flag);
  if (envOverride !== undefined) {
    return envOverride;
  }

  const storedValue = getStoredFlag(flag);
  if (storedValue !== undefined) {
    return storedValue;
  }

  return DEFAULT_FLAGS[flag];
}

type FlagUpdateDetail = {
  flag: FeatureFlagName;
  value: boolean | null;
};

function dispatchFlagEvent(detail: FlagUpdateDetail) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return;
  }

  try {
    window.dispatchEvent(new CustomEvent<FlagUpdateDetail>(FLAG_EVENT, { detail }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to dispatch feature flag event', error);
    }
  }
}

export function setFeatureFlag(flag: FeatureFlagName, value: boolean | null) {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  try {
    if (value === null) {
      window.localStorage.removeItem(storageKey(flag));
    } else {
      window.localStorage.setItem(storageKey(flag), String(value));
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Unable to persist feature flag "${flag}"`, error);
    }
  } finally {
    dispatchFlagEvent({ flag, value });
  }
}

export function resetFeatureFlags() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  (Object.keys(DEFAULT_FLAGS) as FeatureFlagName[]).forEach((flag) => {
    window.localStorage.removeItem(storageKey(flag));
    dispatchFlagEvent({ flag, value: null });
  });
}

export function getAllFeatureFlags(): FeatureFlagState {
  return (Object.keys(DEFAULT_FLAGS) as FeatureFlagName[]).reduce<FeatureFlagState>((acc, flag) => {
    acc[flag] = getFeatureFlag(flag);
    return acc;
  }, {} as FeatureFlagState);
}

export function getFeatureFlagStorageKey(flag: FeatureFlagName) {
  return storageKey(flag);
}

export const FEATURE_FLAG_EVENT = FLAG_EVENT;
export const FEATURE_FLAG_STORAGE_PREFIX = STORAGE_PREFIX;

if (typeof window !== 'undefined') {
  const globalWindow = window as typeof window & {
    heyspexFeatureFlags?: Record<string, unknown>;
  };

  const existing = globalWindow.heyspexFeatureFlags ?? {};
  globalWindow.heyspexFeatureFlags = {
    ...existing,
    get: getFeatureFlag,
    set: setFeatureFlag,
    reset: resetFeatureFlags,
    all: getAllFeatureFlags,
  };
}
