import { log } from './logger';

export interface ColorScheme {
  root: string;
  surface: string;
  elevated: string;
  border: string;
  primary: string;
  secondary: string;
  muted: string;
  accent: string;
  accentHover: string;
  success: string;
  error: string;
}

export interface BrandingConfig {
  appName: string;
  logoUrl: string | null;
  colors: ColorScheme;
}

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

function readColor(key: string, defaultVal: string): string {
  const raw = process.env[key];
  if (!raw) return defaultVal;
  if (HEX_REGEX.test(raw)) return raw;
  log({ op: 'branding.config', outcome: 'warning', message: `Invalid color for ${key}: "${raw}", using default` });
  return defaultVal;
}

function readAppName(): string {
  const raw = process.env.APP_NAME;
  if (!raw || raw.trim().length === 0) return 'GoneNote';
  // Strip HTML tags, trim, limit to 100 chars
  const sanitized = raw.replace(/<[^>]*>/g, '').trim().slice(0, 100);
  return sanitized || 'GoneNote';
}

function readLogoUrl(): string | null {
  const raw = process.env.APP_LOGO_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return raw.slice(0, 2048);
    }
  } catch {
    // Invalid URL — fall through to null
  }
  log({ op: 'branding.config', outcome: 'warning', message: `Invalid APP_LOGO_URL: "${raw}", ignoring` });
  return null;
}

function readColorScheme(): ColorScheme {
  return {
    root: readColor('APP_COLOR_ROOT', '#0a0a0f'),
    surface: readColor('APP_COLOR_SURFACE', '#16161d'),
    elevated: readColor('APP_COLOR_ELEVATED', '#1c1c24'),
    border: readColor('APP_COLOR_BORDER', 'rgba(255,255,255,0.06)'),
    primary: readColor('APP_COLOR_PRIMARY', '#e4e4ec'),
    secondary: readColor('APP_COLOR_SECONDARY', '#9494a4'),
    muted: readColor('APP_COLOR_MUTED', '#5c5c6e'),
    accent: readColor('APP_COLOR_ACCENT', '#3dd6c8'),
    accentHover: readColor('APP_COLOR_ACCENT_HOVER', '#5cdfd4'),
    success: readColor('APP_COLOR_SUCCESS', '#4ade80'),
    error: readColor('APP_COLOR_ERROR', '#fbbf24'),
  };
}

export const branding: BrandingConfig = Object.freeze({
  appName: readAppName(),
  logoUrl: readLogoUrl(),
  colors: Object.freeze(readColorScheme()),
});
