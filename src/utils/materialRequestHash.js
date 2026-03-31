const PREFIX = 'mr_';

export const encodeMaterialRequestId = (id) => {
  const raw = `${PREFIX}${id}`;
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

export const decodeMaterialRequestId = (hashedId) => {
  try {
    const normalized = hashedId.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const decoded = atob(normalized + padding);
    if (!decoded.startsWith(PREFIX)) return null;
    const id = Number(decoded.slice(PREFIX.length));
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
};
