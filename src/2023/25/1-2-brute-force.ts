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
    const [name, rest] = line.split(": ");
    const destinations = rest.split(" ").filter(Boolean);
    return { name, destinations };
  });

const allNames = new Set<string>();

for (const module of input) {
  allNames.add(module.name);
  for (const destination of module.destinations) {
    allNames.add(destination);
  }
}

const allNamesArray = [...allNames.values()];

const allConnections = new Map<string, string[]>(
  allNamesArray.map((name) => [name, []])
);

for (const module of input) {
  for (const destination of module.destinations) {
    allConnections.get(module.name)!.push(destination);
    allConnections.get(destination)!.push(module.name);
  }
}

/**
 * 1552
 */
const nodeNumber = allConnections.size;
/**
 * 3475
 */
const edgesNumber =
  [...allConnections.values()].reduce((acc, curr) => acc + curr.length, 0) / 2;

console.log("nodeNumber", nodeNumber, "edgesNumber", edgesNumber);

const getEdgeKey = (a: string, b: string) => {
  return [a, b].sort().join("-");
};

const allEdges = new Set<string>();

for (const node of allNamesArray) {
  const connections = allConnections.get(node)!;
  for (const connection of connections) {
    allEdges.add(getEdgeKey(node, connection));
  }
}

const allEdgesArray = [...allEdges.values()];

const visitAll = (removedEdges: string[]): number => {
  const visited = new Set<string>();
  const queue = [allNamesArray[0]];

  while (queue.length) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);
    const connections = allConnections.get(node)!;
    for (const connection of connections) {
      const edgeKey = getEdgeKey(node, connection);
      if (removedEdges.includes(edgeKey)) continue;
      queue.push(connection);
    }
  }

  return visited.size;
};

let result: number | null = null;

for (let i = 0; i < allEdgesArray.length - 2; i++) {
  if (result) break;
  const edgeA = allEdgesArray[i];

  for (let j = i + 1; j < allEdgesArray.length - 1; j++) {
    if (result) break;
    const edgeB = allEdgesArray[j];
    for (let k = j + 1; k < allEdgesArray.length; k++) {
      const edgeC = allEdgesArray[k];

      const removedEdges = [edgeA, edgeB, edgeC];

      const visited = visitAll(removedEdges);
      if (visited !== nodeNumber) {
        result = visited * (nodeNumber - visited);
        break;
      }
    }
  }
}

console.log("result", result);
