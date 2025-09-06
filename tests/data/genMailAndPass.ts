// email and password generators

const EMAIL_DOMAIN_PREFIX: string = '@test.test';
const EMAIL_DOMAIN: string = '@qadeletemetest.com';
const GMAIL: string = '@gmail.com';

/**
 * Генерация случайного email с доменом @test.test
 */
export function generateRandomEmailTest(): string {
  const length = 10;
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result + EMAIL_DOMAIN_PREFIX;
}

/**
 * Генерация случайного email с доменом @qadeletemetest.com
 */
export function generateRandomEmail(): string {
  const length = 10;
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result + EMAIL_DOMAIN;
}

/**
 * Генерация случайного email с доменом @gmail.com
 */
export function generateRandomEmailGmail(): string {
  const length = 10;
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result + GMAIL;
}

/**
 * Генерация случайного пароля (обязательно есть строчная, заглавная и цифра)
 */
export function generateRandomPassword(): string {
  const length = 12;
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const allChars = lowerCaseChars + upperCaseChars + numberChars;

  let result = lowerCaseChars.charAt(Math.floor(Math.random() * lowerCaseChars.length));
  result += upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length));
  result += numberChars.charAt(Math.floor(Math.random() * numberChars.length));

  for (let i = 3; i < length; i++) {
    result += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return result.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Генерация пароля с обязательным спецсимволом
 */
export function generateRandomPasswordRequiredCharacter(): string {
  const length = 12;

  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const specialChars = '#$-@&!;%?*()';
  const allChars = lowerCaseChars + upperCaseChars + numberChars + specialChars;

  // хотя бы один спецсимвол
  let result = specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  // хотя бы по одному из каждого набора
  result += lowerCaseChars.charAt(Math.floor(Math.random() * lowerCaseChars.length));
  result += upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length));
  result += numberChars.charAt(Math.floor(Math.random() * numberChars.length));

  for (let i = 4; i < length; i++) {
    result += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return result.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Генерация случайного имени (8–15 символов, первая буква заглавная)
 */
export function generateRandomName(): string {
  const minLength = 8;
  const maxLength = 15;
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  let result = upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length));
  for (let i = 1; i < length; i++) {
    result += upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length)).toLowerCase();
  }

  return result;
}

/**
 * Результат генерации адреса
 */
export interface RandomAddress {
  firstWord: string;
  secondWord: string;
  randomNumber: number;
}

/**
 * Генерация случайного адреса
 */
export function generateRandomAddress(): RandomAddress {
  const minLength = 8;
  const maxLength = 15;
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  // Первое слово (от 8 до 15 символов, первая буква заглавная)
  const firstWordLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const firstWord =
    upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length)) +
    allChars.charAt(Math.floor(Math.random() * allChars.length)).repeat(firstWordLength - 1);

  // Второе слово (от 5 до 10 символов)
  const secondWordLength = Math.floor(Math.random() * 6) + 5;
  const secondWord = allChars.charAt(Math.floor(Math.random() * allChars.length)).repeat(secondWordLength);

  // Число от 1 до 999
  const randomNumber = Math.floor(Math.random() * 999) + 1;

  return {
    firstWord,
    secondWord,
    randomNumber
  };
}
