import { readFileSync } from 'fs';
import * as path from 'path';


const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type SnafuDigit = '0' | '1' | '2' | '-' | '=';

const snafus: string[] = textInput.split('\n').filter(Boolean);

const snafuDigitToDecimal = (snafu: SnafuDigit): number => {
  switch (snafu) {
    case '0':
      return 0;
    case '1':
      return 1;
    case '2':
      return 2;
    case '-':
      return -1;
    case '=':
      return -2;

  }
}

const snafuToDecimal = (snafu: string): number => {
  let result = 0;
  const length = snafu.length;
  for (let n = 0; n < length; n++) {
    result += snafuDigitToDecimal(snafu[n] as SnafuDigit) * (5 ** (length - n - 1))
  }
  return result;
}

const decimals = snafus.map(snafuToDecimal);

const decimalResult = decimals.reduce((a, b) => a + b, 0);

console.log('decimalResult', decimalResult);

const decimalToSnafuDigit = (decimal: number): string => {
  const base5 = decimal.toString(5);
  let add1 = false;
  let snafuString = '';

  const length = base5.length;
  for (let n = 0; n < length; n++) {
    let digitBase5 = parseInt(base5[length - n - 1]);
    if (add1) {
      digitBase5++;
    }
    if (digitBase5 < 3) {
      add1 = false;
      snafuString = digitBase5.toString() + snafuString;
    } else {

      add1 = true;
      if (digitBase5 === 3) {

        snafuString = '=' + snafuString;
      } else if (digitBase5 === 4) {
        snafuString = '-' + snafuString;
      } else if (digitBase5 === 5) {
        snafuString = '0' + snafuString;
      } else {
        throw new Error('This should not happen');
      }
    }
  }
  return snafuString;
}


const snafuResult = decimalToSnafuDigit(decimalResult);

console.log('snafuResult', snafuResult); // 121=2=1==0=10=2-20=2
