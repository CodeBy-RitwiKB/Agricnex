import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

const getEncryptionKey = () => {
  const masterKey = process.env.ADMIN_2FA_MASTER_KEY || "agrinex_military_grade_secret_key_2026";
  return crypto.createHash('sha256').update(masterKey).digest();
};

export function encryptSeed(seed) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(seed, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decryptSeed(encryptedString) {
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted format");
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

function base32ToHex(base32) {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let hex = "";

  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substring(i, i + 4);
    hex += parseInt(chunk, 2).toString(16);
  }
  return hex;
}

export function verifyTOTP(token, secret) {
  try {
    const cleanedSecret = secret.replace(/\s+/g, '');
    const key = Buffer.from(base32ToHex(cleanedSecret), 'hex');
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const currentCounter = Math.floor(epoch / 30);
    
    for (let skew = -1; skew <= 1; skew++) {
      const counter = currentCounter + skew;
      const timeHex = counter.toString(16).padStart(16, '0');
      const timeBuffer = Buffer.from(timeHex, 'hex');
      
      const hmac = crypto.createHmac('sha1', key);
      hmac.update(timeBuffer);
      const hmacResult = hmac.digest();
      
      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const binary = ((hmacResult[offset] & 0x7f) << 24) |
                     ((hmacResult[offset + 1] & 0xff) << 16) |
                     ((hmacResult[offset + 2] & 0xff) << 8) |
                     (hmacResult[offset + 3] & 0xff);
      
      const calculatedToken = (binary % 1000000).toString().padStart(6, '0');
      
      const cleanedUserToken = token.replace(/[-\s]+/g, '');
      if (cleanedUserToken === calculatedToken) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("TOTP verification error:", error);
    return false;
  }
}
