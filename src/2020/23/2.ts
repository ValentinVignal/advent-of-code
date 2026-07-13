import { readFileSync } from "fs";
import * as path from "path";

const example: number = 0;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

type Cups = Map<number, number>;

const cupsArray: number[] = textInput.split("").filter(Boolean).map(Number);

const initialLength = cupsArray.length;

const cups: Cups = new Map<number, number>();

for (let i = 0; i < cupsArray.length - 1; i++) {
  const current = cupsArray[i];
  const next = cupsArray[i + 1];
  cups.set(current, next);
}

const length = example === 1 ? 9 : 1_000_000;

for (let i = initialLength + 1; i <= length; i++) {
  let from: number;
  if (i === initialLength + 1) {
    from = cupsArray[initialLength - 1];
  } else {
    from = i - 1;
  }
  cups.set(from, i);
}

cups.set(example === 1 ? cupsArray[length - 1] : length, cupsArray[0]);

console.log("size", cups.size);

let currentValue = cupsArray[0];

const doMove = (): void => {
  // current -> pickedValue1 -> pickedValue2 -> pickedValue3 -> afterPickedValue3
  // destinationValue -> afterDestinationValue

  // Start pick.
  const pickedValue1 = cups.get(currentValue)!;
  const pickedValue2 = cups.get(pickedValue1)!;
  const pickedValue3 = cups.get(pickedValue2)!;

  const picked = [pickedValue1, pickedValue2, pickedValue3];

  // current -> afterPickedValue3
  // pickedValue1 -> pickedValue2 -> pickedValue3
  // destinationValue -> afterDestinationValue
  const afterPickedValue3 = cups.get(pickedValue3)!;
  cups.set(currentValue, afterPickedValue3);

  // End pick.

  // Destination
  let destinationValue = currentValue - 1;
  if (destinationValue <= 0) {
    destinationValue = length;
  }
  while (picked.includes(destinationValue)) {
    destinationValue--;
    if (destinationValue <= 0) {
      destinationValue = length;
    }
  }

  const afterDestinationValue = cups.get(destinationValue)!;

  // current -> afterPickedValue3
  // destinationValue -> pickedValue1 -> pickedValue2 -> pickedValue3 -> afterDestinationValue

  cups.set(destinationValue, pickedValue1);
  cups.set(pickedValue3, afterDestinationValue);

  currentValue = cups.get(currentValue)!;
};

for (let i = 0; i < (example === 1 ? 10 : 10_000_000); i++) {
  if (!(i % 1_000_000)) {
    console.log("i", i);
  }
  doMove();
}

const value1 = cups.get(1)!;
const value2 = cups.get(value1)!;

console.log("value1", value1, "value2", value2);

const result = value1 * value2;

// x != 32
console.log(result); // 11591415792
