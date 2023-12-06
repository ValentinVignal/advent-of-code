import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const [times, distances] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split(":")[1].split(" ").filter(Boolean).map(Number));

type Race = {
  time: number;
  distance: number;
};

const races: Race[] = [];

for (let i = 0; i < times.length; i++) {
  races.push({ time: times[i], distance: distances[i] });
}

const wins = races.map((race) => {
  let win = 0;
  for (let hold = 0; hold < race.time; hold++) {
    if ((race.time - hold) * hold > race.distance) {
      win++;
    }
  }
  return win;
});

const result = wins.reduce((acc, win) => acc * win, 1);

console.log(result); // 800280
