import { createCipheriv, createDecipheriv } from 'crypto';

import { LogProvider } from '@core/providers/LogProvider';


const zLog = new LogProvider('Encryption Utils')

export const encrypt = (data: any, secret: any, iv: any): { authTag: string, encryptedString: string } => {
  try {
    const cipher = createCipheriv('aes-256-gcm', secret, iv);
    const encryptedString = `${cipher.update(JSON.stringify(data), 'utf-8', 'hex')}${cipher.final('hex')}`;
    
    return {
      authTag: cipher.getAuthTag().toString('hex'),
      encryptedString
    };
  } catch (err) {
    zLog.error(`[ENCRYPTION] Error Stack => ${err}`);
    throw err;
  }
}

export const decrypt = (data: string, secret: any, iv: any, authTag: string): string => {
  try {
    const decipher = createDecipheriv('aes-256-gcm', secret, iv);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    return `${decipher.update(data, 'hex', 'utf-8')}${decipher.final('utf-8')}`;
  } catch (err) {
    zLog.error(`[DECRYPTION] Error Stack => ${err}`);
    throw err;
  }
}