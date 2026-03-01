const _r = new Map();
export const registry = {
  set: (k, fn) => _r.set(k, fn),
  get: (k)     => _r.get(k),
};
