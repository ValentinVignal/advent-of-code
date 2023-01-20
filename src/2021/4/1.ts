import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const splittedTextInput = textInput.split('\n\n').filter(Boolean);

const numbers = splittedTextInput[0].split(',').filter(Boolean).map((num) => parseInt(num));

const boards = splittedTextInput.slice(1).map((textMap) => {
  return textMap.split('\n').filter(Boolean).map((line) => {
    return line.split(/ +/).filter(Boolean).map((num) => parseInt(num));
  });
});

let n = 1;

const winnerIndex = (): number => {
  const markedNumbers = numbers.slice(0, n);
  return boards.findIndex((board) => {
    for (let i = 0; i < 5; i++) {
      if (
        // Has a line
        board[i].every((num) => markedNumbers.includes(num))
        // Has a column
        || board.every((line) => markedNumbers.includes(line[i]))
      ) {
        return true;
      }
    }
    return false;
  });
}

const hasWinner = (): boolean => {
  return winnerIndex() !== -1;
}

while (!hasWinner()) {
  n++;
}

const board = boards[winnerIndex()];

const markedNumbers = numbers.slice(0, n);

const unmarkedNumberSum = board.reduce((acc, line) => {
  return acc + line.reduce((acc, num) => {
    return acc + (markedNumbers.includes(num) ? 0 : num);
  }, 0);
}, 0);

// 2674 < x 
console.log(unmarkedNumberSum * (numbers[n - 1])); // 4662
