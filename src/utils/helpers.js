const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomNumber = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '');
};

const isEmpty = (value) => {
  return value == null || value === '' ||
         (Array.isArray(value) && value.length === 0) ||
         (typeof value === 'object' && Object.keys(value).length === 0);
};

const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

const toSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const capitalize = (str) => {
  if (typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const snakeToCamel = (str) => {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const maskString = (str, visibleChars = 4) => {
  if (!str || str.length <= visibleChars) return str;
  const visible = str.slice(0, visibleChars);
  const masked = '*'.repeat(str.length - visibleChars);
  return visible + masked;
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const removeUndefined = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

module.exports = {
  sleep,
  generateRandomString,
  generateRandomNumber,
  sanitizeString,
  isEmpty,
  deepClone,
  formatDate,
  toSlug,
  capitalize,
  camelToSnake,
  snakeToCamel,
  parsePagination,
  getPaginationMeta,
  isValidEmail,
  maskString,
  generateUUID,
  removeUndefined
};
