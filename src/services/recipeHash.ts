import { VesselType, BoilMethod } from '@/domain/enums';
import type { BrewParameters, RecipeHashPayload } from '@/domain/appTypes';

export type { RecipeHashPayload };

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const bin = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  const restored = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (restored.length % 4)) % 4);
  const bin = atob(restored + padding);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function checksum8(data: string): number {
  let sum = 0;
  const bytes = new TextEncoder().encode(data);
  for (let i = 0; i < bytes.length; i++) {
    sum = (sum + bytes[i]) & 0xff;
  }
  return sum;
}

export interface DecodedRecipe {
  success: true;
  params: BrewParameters & { steepTimeSec: number };
  name: string;
}

export interface DecodeError {
  success: false;
  error: string;
}

export type DecodeResult = DecodedRecipe | DecodeError;

export function encodeRecipe(params: BrewParameters & { steepTimeSec: number }): string {
  const payload: RecipeHashPayload = {
    v: 1,
    n: params.teaName || 'Untitled',
    t: params.teaType,
    T: params.temperature,
    s: params.steepTimeSec,
    r: params.leafMass,
    w: params.waterVolume,
    c: params.steepCount,
    d: params.tds,
    a: params.altitude,
    l: params.leafSize,
  };
  const json = JSON.stringify(payload);
  const b64 = base64UrlEncode(json);
  const chk = checksum8(json).toString(16).padStart(2, '0');
  return `${b64}~${chk}`;
}

export function decodeRecipe(hash: string): DecodeResult {
  try {
    const sepIndex = hash.lastIndexOf('~');
    const b64 = sepIndex >= 0 ? hash.slice(0, sepIndex) : hash;
    const chk = sepIndex >= 0 ? hash.slice(sepIndex + 1) : undefined;

    const json = base64UrlDecode(b64);

    if (chk !== undefined && chk.length > 0) {
      const expected = parseInt(chk, 16);
      if (Number.isNaN(expected) || checksum8(json) !== expected) {
        return { success: false, error: 'Invalid recipe code: checksum mismatch' };
      }
    }

    const payload = JSON.parse(json) as RecipeHashPayload;
    if (payload.v !== 1) {
      return { success: false, error: 'Unsupported recipe version' };
    }

    const params: BrewParameters & { steepTimeSec: number } = {
      teaType: payload.t,
      teaName: payload.n,
      vessel: VesselType.Glass,
      boilMethod: BoilMethod.Electric,
      temperature: payload.T,
      leafMass: payload.r,
      waterVolume: payload.w,
      steepCount: payload.c,
      tds: payload.d,
      altitude: payload.a,
      leafSize: payload.l,
      steepTimeSec: payload.s,
    };

    return { success: true, params, name: payload.n };
  } catch {
    return { success: false, error: 'Invalid recipe code' };
  }
}
