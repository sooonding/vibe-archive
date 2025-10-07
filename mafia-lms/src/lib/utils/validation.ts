export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
