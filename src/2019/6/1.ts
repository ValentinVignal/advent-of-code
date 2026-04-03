import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const orbitsInput: [string, string][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [a, b] = line.split(")");
    return [a, b];
  });

const orbits = new Map<string, string>();

for (const [a, b] of orbitsInput) {
  orbits.set(b, a);
}

const count = new Map<string, Set<string>>();

const visited = new Set<string>();

const countOrbits = (key: string): void => {
  if (visited.has(key)) return;
  visited.add(key);
  if (!count.has(key)) {
    count.set(key, new Set());
  }
  if (orbits.has(key)) {
    const sub = orbits.get(key)!;
    countOrbits(sub);

    const orbitCount = count.get(key)!;
    orbitCount.add(sub);
    for (const a of count.get(sub)!) {
      orbitCount.add(a);
    }
  }
};

for (const key of orbits.keys()) {
  countOrbits(key);
}

const result = [...count.values()]
  .map((value) => value.size)
  .reduce((a, b) => a + b, 0);

console.log(result); // 162816
