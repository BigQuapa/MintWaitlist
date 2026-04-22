import { customAlphabet } from 'nanoid';

const alphabet = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const generate = customAlphabet(alphabet, 12);

export function newToken(): string {
  return generate();
}
