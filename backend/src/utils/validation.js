/**
 * Validation Utility
 */

exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.validateUserId = (userId) => {
  return userId && userId.length >= 3 && userId.length <= 50;
};

exports.validatePassword = (password) => {
  return password && password.length >= 6;
};

exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>\"'&]/g, (char) => {
    const map = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    };
    return map[char];
  });
};

exports.isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

exports.isValidIPFSHash = (hash) => {
  return /^Qm[a-zA-Z0-9]{44}$/.test(hash) || /^ba[a-zA-Z2-7]{55}$/.test(hash);
};
