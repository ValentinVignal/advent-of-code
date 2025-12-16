import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const [timestampText, linesText] = textInput.split("\n");

const timestamp = parseInt(timestampText);

const buses = linesText
  .split(",")
  .filter((id) => id !== "x")
  .map(Number);

const busesWithTimeToNextDeparture = buses.map((bus) => {
  const timeSinceLastDeparture = timestamp % bus;
  const timeToNextDeparture = (bus - timeSinceLastDeparture) % bus;
  return {
    id: bus,
    timeToNextDeparture,
  };
});

const min = Math.min(
  ...busesWithTimeToNextDeparture.map((item) => item.timeToNextDeparture)
);

const bus = busesWithTimeToNextDeparture.find(
  (bus) => bus.timeToNextDeparture === min
)!;

const result = bus.id * bus?.timeToNextDeparture;

console.log(result); // 102
