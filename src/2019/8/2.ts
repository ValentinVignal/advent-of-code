import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const input = textInput.split("").filter(Boolean).map(Number);

const layers: number[][] = [];

for (let i = 0; i < input.length; i += 25 * 6) {
  layers.push(input.slice(i, i + 25 * 6));
}

const flattenImage = Array(25 * 6).fill(null);

for (let i = 0; i < flattenImage.length; i++) {
  let j = 0;
  while (layers[j][i] === 2) {
    j++;
  }
  flattenImage[i] = layers[j][i];
}

const logImage = (): void => {
  let array: number[][] = [];
  for (let j = 0; j < 6; j++) {
    array.push(flattenImage.slice(25 * j, 25 * (j + 1)));
  }
  const s = array
    .map((line) =>
      line
        .map((value) => {
          if (value === 0) {
            return "\x1b[1m\x1b[34m0\x1b[0m";
          } else {
            return "\x1b[1m\x1b[33m1\x1b[0m";
          }
        })
        .join(""),
    )
    .join("\n");
  console.log(s);
};

logImage();

// AZCJC
