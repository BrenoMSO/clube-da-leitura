export const getParamString = (param: unknown): string => {
  if (Array.isArray(param)) {
    return param[0] ? String(param[0]) : '';
  }
  return param ? String(param) : '';
};
