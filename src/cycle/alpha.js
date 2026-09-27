import { betaLabel } from './beta.js';

export function alphaLabel(n) {
  return n > 0 ? `alpha:${betaLabel(n - 1)}` : 'alpha';
}
