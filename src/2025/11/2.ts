import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example-2" : ""}.txt`),
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

const cache = new Map<string, Count>();

/**
 * Returns the number of path.
 * - none is the count of the if no dac or fft is visited before.
 * - dac is the count if only dac is visited before.
 * - fft is the count if only fft is visited before.
 * - both is the count if both dac and fft are visited before.
 */
type Count = {
  dac: number;
  fft: number;
  both: number;
  none: number;
};

const addCounts = (a: Count, b: Count): Count => ({
  dac: a.dac + b.dac,
  fft: a.fft + b.fft,
  both: a.both + b.both,
  none: a.none + b.none,
});

const getPathCount = (start: string, visited: string[]): Count => {
  if (start === "out") {
    return {
      dac: 0,
      fft: 0,
      both: 1,
      none: 0,
    };
  }

  if (cache.has(start)) {
    return cache.get(start)!;
  }
  const outputs = devicesMap.get(start) ?? [];
  const newVisited = [...visited, start];
  const result = outputs.reduce(
    (count, output) => {
      return addCounts(count, getPathCount(output, newVisited));
    },
    {
      dac: 0,
      fft: 0,
      both: 0,
      none: 0,
    }
  );
  if (start === "dac") {
    result.none = result.dac;
    result.fft = result.both;
  } else if (start === "fft") {
    result.none = result.fft;
    result.dac = result.both;
  }
  cache.set(start, result);
  return result;
};

const pathCount = getPathCount("svr", []);

console.log(`Path count: ${pathCount.none}`); // 417190406827152
