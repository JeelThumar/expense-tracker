export const normalizeName = (name) => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export const normalizePeopleList = (listStr) => {
  if (!listStr) return '';
  return listStr
    .split(',')
    .map(n => normalizeName(n))
    .filter(Boolean)
    .join(', ');
};
