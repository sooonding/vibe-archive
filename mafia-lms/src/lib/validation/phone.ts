export const isValidPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  return /^\d{10,11}$/.test(normalized);
};

export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};
