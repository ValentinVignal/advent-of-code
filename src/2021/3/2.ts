import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean);

let oxygenCandidates = [...input];

let index = 0;
while (oxygenCandidates.length > 1 && index < input[0].length) {
  const bits = oxygenCandidates.map((candidate) => candidate[index]);
  const zeros = bits.filter((bit) => bit === '0').length;
  const ones = bits.length - zeros;
  if (ones >= zeros) {
    oxygenCandidates = oxygenCandidates.filter((candidate) => candidate[index] === '1');
  } else {
    oxygenCandidates = oxygenCandidates.filter((candidate) => candidate[index] === '0');
  }
  index++;
}

let scrubberCandidates = [...input];

index = 0;
while (scrubberCandidates.length > 1 && index < input[0].length) {
  const bits = scrubberCandidates.map((candidate) => candidate[index]);
  const zeros = bits.filter((bit) => bit === '0').length;
  const ones = bits.length - zeros;
  if (ones >= zeros) {
    scrubberCandidates = scrubberCandidates.filter((candidate) => candidate[index] === '0');
  } else {
    scrubberCandidates = scrubberCandidates.filter((candidate) => candidate[index] === '1');
  }
  index++;
}

const oxygen = parseInt(oxygenCandidates[0], 2);
const scrubber = parseInt(scrubberCandidates[0], 2);

console.log(oxygen * scrubber);  // 3385170
