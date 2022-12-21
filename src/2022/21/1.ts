import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input-example.txt'), 'utf-8').trim();

type Monkey = {
  name: string
  num?: number;
  operation?: () => number;
}

const monkeyMap = new Map<Monkey['name'], Monkey>();

const evalMonkey = (monkeyName: Monkey['name']): number => {
  const monkey = monkeyMap.get(monkeyName)!;
  return monkey.num ?? monkey.operation!();
}


const monkeyList: Monkey[] = textInput.split('\n').filter(Boolean).map((line) => {
  const name = line.split(':')[0];
  const rest = line.split(':')[1].trim();

  const monkey: Monkey = {
    name,
  };

  if (isNaN(parseInt(rest))) {
    const [left, op, right] = rest.split(' ');
    monkey.operation = () => {
      const leftEval = evalMonkey(left);
      const rightEval = evalMonkey(right);
      switch (op) {
        case '+':
          return leftEval + rightEval;
        case '-':
          return leftEval - rightEval
        case '*':
          return leftEval * rightEval;
        case '/':
          return leftEval / rightEval
        default:
          throw Error(`Unsupported operator: ${op}`);
      }
    }
  } else {
    monkey.num = parseInt(rest);
  }
  return monkey
});

for (const monkey of monkeyList) {
  monkeyMap.set(monkey.name, monkey);
}

const result = evalMonkey('root');

console.log(result); // 194058098264286
