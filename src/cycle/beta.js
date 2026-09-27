import { alphaLabel } from './alpha.js';

export function betaLabel(n) {
  return n > 0 ? `beta:${alphaLabel(n - 1)}` : 'beta';
}
