/** Read a value from a nested object using a dot-path, e.g. 'features.heading' */
export function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/** Return a new object with the value at dot-path set to `value` (immutable) */
export function setByPath(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  if (keys.length === 1) return { ...obj, [keys[0]]: value };
  const [first, ...rest] = keys;
  return { ...obj, [first]: setByPath(obj[first] ?? {}, rest.join('.'), value) };
}
