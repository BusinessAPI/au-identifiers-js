const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const ACN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 1];
const TFN_WEIGHTS_9 = [1, 4, 3, 7, 5, 8, 6, 9, 10];
const TFN_WEIGHTS_8 = [1, 4, 3, 7, 5, 8, 6, 10];
const VIN = /^[A-HJ-NPR-Z0-9]{17}$/;

function digits(value: unknown, lengths: number[]): string | null {
  if (typeof value !== 'string' && !(typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)) {
    return null;
  }
  const compact = String(value).replace(/[ \t\n\r\v\f-]/g, '');
  return lengths.includes(compact.length) && /^[0-9]+$/.test(compact) ? compact : null;
}

function weightedSum(value: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length && i < value.length; i++) sum += Number(value[i]) * weights[i];
  return sum;
}

export function normaliseAbn(value: unknown): string | null {
  const abn = digits(value, [11]);
  if (abn === null) return null;
  // Subtract 1 from the first digit, then the weighted sum must be divisible by 89.
  const total = (Number(abn[0]) - 1) * ABN_WEIGHTS[0] + weightedSum(abn.slice(1), ABN_WEIGHTS.slice(1));
  return total % 89 === 0 ? abn : null;
}

export function isValidAbn(value: unknown): boolean {
  return normaliseAbn(value) !== null;
}

export function formatAbn(value: unknown): string | null {
  const abn = normaliseAbn(value);
  return abn && `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8)}`;
}

export function normaliseAcn(value: unknown): string | null {
  const acn = digits(value, [9]);
  if (acn === null) return null;
  const check = (10 - (weightedSum(acn, ACN_WEIGHTS) % 10)) % 10;
  return Number(acn[8]) === check ? acn : null;
}

export function isValidAcn(value: unknown): boolean {
  return normaliseAcn(value) !== null;
}

export function formatAcn(value: unknown): string | null {
  const acn = normaliseAcn(value);
  return acn && `${acn.slice(0, 3)} ${acn.slice(3, 6)} ${acn.slice(6)}`;
}

export const normaliseArbn = normaliseAcn;
export const isValidArbn = isValidAcn;
export const formatArbn = formatAcn;

export interface TfnOptions {
  individual?: boolean;
}

export function normaliseTfn(value: unknown, options: TfnOptions = {}): string | null {
  // 8-digit TFNs (organisations only) have their own weights. A 9-digit TFN with a leading
  // zero passes on either the 9-digit check or the 8-digit check of the rest.
  const tfn = digits(value, options.individual ? [9] : [8, 9]);
  if (tfn === null) return null;
  if (tfn.length === 9 && tfn.replace(/^0+/, '').length >= 8 && weightedSum(tfn, TFN_WEIGHTS_9) % 11 === 0) {
    return tfn;
  }
  const core = tfn.replace(/^0+/, '');
  const weights = core.length === 9 ? TFN_WEIGHTS_9 : core.length === 8 ? TFN_WEIGHTS_8 : null;
  return weights && weightedSum(core, weights) % 11 === 0 ? tfn : null;
}

export function isValidTfn(value: unknown, options: TfnOptions = {}): boolean {
  return normaliseTfn(value, options) !== null;
}

export function normaliseDirectorId(value: unknown): string | null {
  // Format only. The check digit method is only given to ATO-registered software providers.
  const did = digits(value, [15]);
  return did && did.startsWith('036') ? did : null;
}

export function isValidDirectorId(value: unknown): boolean {
  return normaliseDirectorId(value) !== null;
}

export function normaliseVin(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.replace(/^[ \t\n\r\v\f]+|[ \t\n\r\v\f]+$/g, '');
  if (!/^[\x00-\x7f]*$/.test(trimmed)) return null;
  const vin = trimmed.toUpperCase();
  return VIN.test(vin) ? vin : null;
}

export function isValidVin(value: unknown): boolean {
  return normaliseVin(value) !== null;
}
