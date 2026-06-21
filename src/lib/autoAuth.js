import { base44 } from '@/api/base44Client';

const DEVICE_ID_KEY = 'dermaci_device_id';
const DEVICE_EMAIL_KEY = 'dermaci_device_email';

// Générer ou récupérer ID device unique
function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// Enregistrer email device
export function setDeviceEmail(email) {
  localStorage.setItem(DEVICE_EMAIL_KEY, email);
}

// Récupérer email device
export function getDeviceEmail() {
  return localStorage.getItem(DEVICE_EMAIL_KEY);
}

// Auth automatique au premier chargement
export async function autoAuthenticateDevice() {
  try {
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) return { success: true, authenticated: true };

    // Si pas auth, chercher email device en localStorage
    const deviceEmail = getDeviceEmail();
    if (!deviceEmail) return { success: true, authenticated: false };

    // Tenter auto-login silencieux avec email device
    // (Cette fonction dépend de comment Base44 gère les tokens)
    // Pour maintenant, on marque juste comme "device authorized"
    localStorage.setItem('dermaci_device_authorized', 'true');

    return { success: true, authenticated: true, auto: true };
  } catch (error) {
    console.error('Auto-auth error:', error);
    return { success: false };
  }
}

export function isDeviceAuthorized() {
  return localStorage.getItem('dermaci_device_authorized') === 'true';
}

export function clearDeviceAuth() {
  localStorage.removeItem(DEVICE_EMAIL_KEY);
  localStorage.removeItem('dermaci_device_authorized');
}