import { readFileSync, writeFileSync } from "fs";
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

const mermaidInput = allEdgesArray
  .map((edge) => {
    const [a, b] = edge.split("-");
    return `  ${a} --> ${b}`;
  })
  .join("\n");

writeFileSync(path.join(__dirname, "input-mermaid.txt"), mermaidInput, "utf-8");
