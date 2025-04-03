/**
 * Generates a cryptographically secure UUID (v4) using Web Crypto API.
 *
 * @returns {string} A secure, random UUID.
 */
const generateSecureUUID = () => {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
  
    // Set the version (4) and variant (RFC4122) bits for UUID v4
    arr[6] = (arr[6] & 0x0f) | 0x40; // Version 4 (random)
    arr[8] = (arr[8] & 0x3f) | 0x80; // Variant RFC4122
  
    // Convert to a UUID string
    const uuid = [...arr].map((byte, index) => {
      // Insert hyphens at the correct positions (8-4-4-4-12)
      return (index === 4 || index === 6 || index === 8 || index === 10) ? '-' : byte.toString(16).padStart(2, '0');
    }).join('');
  
    return uuid;
};

module.exports = {generateSecureUUID}
