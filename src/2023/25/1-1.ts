import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Module = {
  name: string;
  destinations: string[];
};

const input: Module[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [name, rest] = line.split(":");
    const destinations = rest.split(" ");
    return { name, destinations };
  });

const allNames = new Set<string>();

for (const module of input) {
  allNames.add(module.name);
  for (const destination of module.destinations) {
    allNames.add(destination);
  }
}

const allConnections = new Map<string, string[]>(
  [...allNames.values()].map((name) => [name, []])
);

for (const module of input) {
  for (const destination of module.destinations) {
    allConnections.get(module.name)!.push(destination);
    allConnections.get(destination)!.push(module.name);
  }
}

const modulesToConnectionName = (moduleA: string, moduleB: string): string => {
  return [moduleA, moduleB].sort().join("-");
};

const connectionCount = new Map<string, number>();

const findShortestPath = (origin: string, destination: string): void => {
  type ToProcess = {
    name: string;
    path: string[];
  };

  const toProcess: ToProcess[] = [{ name: origin, path: [] }];

  let solution: ToProcess | null = null;

  while (!solution) {
    const { name, path } = toProcess.shift()!;
    if (name === destination) {
      solution = { name, path: [...path, name] };
    }
    const destinations = allConnections.get(name)!;
    for (const destination of destinations) {
      if (path.includes(destination)) {
        continue;
      }
      toProcess.push({ name: destination, path: [...path, name] });
    }
  }

  for (let i = 0; i < solution.path.length - 1; i++) {
    const connectionName = modulesToConnectionName(
      solution.path[i],
      solution.path[i + 1]
    );
    connectionCount.set(
      connectionName,
      (connectionCount.get(connectionName) ?? 0) + 1
    );
  }
};

const allNamesArray = [...allNames.values()];
for (const [index, origin] of allNamesArray.entries()) {
  for (const destination of allNamesArray.slice(index + 1)) {
    findShortestPath(origin, destination);
  }
}

console.log([...connectionCount.values()].sort((a, b) => b - a).slice(0, 10));

console.log(connectionCount.size);
