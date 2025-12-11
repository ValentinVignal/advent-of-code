import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Device = {
  label: string;
  outputs: string[];
};

const devices: Device[] = textInput.split("\n").map((line) => {
  const [label, outputsString] = line.split(": ");
  const outputs = outputsString.split(" ");
  return { label, outputs } as Device;
});

const devicesMap = new Map<string, string[]>(
  devices.map((device) => [device.label, device.outputs])
);

const getPathCount = (start: string, visited: string[]): number => {
  if (start === "out") return 1;
  const outputs = devicesMap.get(start) ?? [];
  const newVisited = [...visited, start];
  return outputs
    .filter((output) => !visited.includes(output))
    .reduce((count, output) => {
      return count + getPathCount(output, newVisited);
    }, 0);
};

const pathCount = getPathCount("you", []);

console.log(`Path count: ${pathCount}`); // 643
