const CLIENT_ID_KEY = 'otto-client-id-v1';

export interface AccessCredentials {
  initData: string;
  clientId: string;
}

export function getTelegramInitData() {
  return window.Telegram?.WebApp?.initData || '';
}

export function getClientId() {
  try {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const value = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `otto-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(CLIENT_ID_KEY, value);
    return value;
  } catch {
    return `otto-session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function getAccessCredentials(): AccessCredentials {
  return {
    initData: getTelegramInitData(),
    clientId: getClientId(),
  };
}
