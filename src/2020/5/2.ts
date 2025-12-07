import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const ids = textInput.split("\n").map((line) => {
  const row = line.slice(0, 8).replaceAll("F", "0").replaceAll("B", "1");
  const col = line.slice(7).replaceAll("L", "0").replaceAll("R", "1");
  const rowNum = parseInt(row, 2);
  const colNum = parseInt(col, 2);
  return rowNum * 8 + colNum;
});

const maxId = Math.max(...ids);
const minId = Math.min(...ids);

let result: number;

for (let id = minId; id <= maxId; id++) {
  if (!ids.includes(id)) {
    result = id;
    break;
  }
}

console.log(result!); // 504
