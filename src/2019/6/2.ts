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
const vertices = new Map<string, string[]>();

for (const [a, b] of orbitsInput) {
  orbits.set(b, a);

  if (!vertices.has(a)) {
    vertices.set(a, []);
  }
  if (!vertices.has(b)) {
    vertices.set(b, []);
  }
  vertices.get(a)!.push(b);
  vertices.get(b)!.push(a);
}

const start = orbits.get("YOU")!;
const end = orbits.get("SAN")!;

type State = {
  name: string;
  distance: number;
};

const queue: State[] = vertices
  .get(start)!
  .map((value) => ({ name: value, distance: 1 }));

const visited = new Set<string>();

let result: number;

while (queue.length) {
  const next = queue.shift()!;
  if (visited.has(next.name)) {
    continue;
  }
  visited.add(next.name);
  if (next.name === end) {
    result = next.distance;
    break;
  }
  const nextObjects = vertices.get(next.name);
  if (nextObjects) {
    queue.push(
      ...nextObjects.map((value) => ({
        name: value,
        distance: next.distance + 1,
      })),
    );
  }
}

console.log(result!); // 304
