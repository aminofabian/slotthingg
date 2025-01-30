/**
 * Generates a random string of uppercase letters
 */
function generateRandomLetters(length: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

/**
 * Generates a random number with leading zeros
 */
function generateRandomNumber(length: number): string {
  const num = Math.floor(Math.random() * Math.pow(10, length));
  return num.toString().padStart(length, '0');
}

/**
 * Generates a unique username in the format player1234XYZ
 */
export function generateUsername(): string {
  const numbers = generateRandomNumber(4);
  const letters = generateRandomLetters(3);
  return `player${numbers}${letters}`;
} 