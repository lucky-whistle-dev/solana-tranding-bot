import { createCipheriv, createDecipheriv, Encoding } from 'crypto';

import { LogProvider } from '@core/providers/LogProvider';
import { extractErrorMessage } from '@core/utils/Utils';


const zLog = new LogProvider('Encryption Utils');

export const encrypt = (data: any, secret: any, iv: any): { authTag: string, encryptedString: string } => {
  try {
    const cipher = createCipheriv(CIPHER, secret, iv);
    const encryptedString = `${cipher.update(JSON.stringify(data), ENCODINGMAP.UTF8, ENCODINGMAP.HEX)}${cipher.final(ENCODINGMAP.HEX)}`;
    
    return { authTag: cipher.getAuthTag().toString(ENCODINGMAP.HEX), encryptedString };
  } catch (err) {
    zLog.error(extractErrorMessage(err));
    throw err;
  }
}

export const decrypt = (data: string, secret: any, iv: any, authTag: string): string => {
  try {
    const decipher = createDecipheriv(CIPHER, secret, iv);
    decipher.setAuthTag(Buffer.from(authTag, ENCODINGMAP.HEX));

    return `${decipher.update(data, ENCODINGMAP.HEX, ENCODINGMAP.UTF8)}${decipher.final(ENCODINGMAP.UTF8)}`;
  } catch (err) {
    zLog.error(extractErrorMessage(err));
    throw err;
  }
}


const CIPHER = 'aes-256-gcm';
const ENCODINGMAP: { [encoding: string]: Encoding } = {
  HEX: 'hex',
  UTF8: 'utf-8',
};