// cspell:ignore karger

import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Node = string;
type Edge = `${Node}-${Node}`;

type Module = {
  name: Node;
  destinations: Node[];
};

const input: Module[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [name, rest] = line.split(": ");
    const destinations = rest.split(" ").filter(Boolean);
    return { name, destinations };
  });

const allNames = new Set<Node>();

for (const module of input) {
  allNames.add(module.name);
  for (const destination of module.destinations) {
    allNames.add(destination);
  }
}

const allNamesArray = [...allNames.values()];

const allConnections = new Map<Node, Node[]>(
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

const getEdgeKey = (a: Node, b: Node): Edge => {
  return [a, b].sort().join("-") as Edge;
};

const allEdges = new Set<Edge>();

for (const node of allNamesArray) {
  const connections = allConnections.get(node)!;
  for (const connection of connections) {
    allEdges.add(getEdgeKey(node, connection));
  }
}

const allEdgesArray = [...allEdges.values()];

type KargerResult = {
  sizes: [number, number];
  cut: number;
};

/**
 * https://web.stanford.edu/class/archive/cs/cs161/cs161.1172/CS161Lecture16.pdf
 */
const karger = (): KargerResult => {
  const superNodes: Map<Node, number> = new Map<Node, number>();
  const superEdges: Map<Edge, number> = new Map<Edge, number>();

  /**
   * Initialize the superNodes and superEdges.
   */
  const initialize = (): void => {
    for (const node of allNamesArray) {
      superNodes.set(node, 1);
    }
    for (const edge of allEdgesArray) {
      superEdges.set(edge, 1);
    }
  };

  initialize();

  const mergeSuperNodes = (a: Node, b: Node): void => {
    const [nodeToKeep, nodeToRemove] = [a, b].sort();
    const nodeToRemoveCount = superNodes.get(nodeToRemove)!;
    superNodes.delete(nodeToRemove);
    superNodes.set(nodeToKeep, superNodes.get(nodeToKeep)! + nodeToRemoveCount);

    // Remove the edge between a and b.
    const edgeToRemove = getEdgeKey(a, b);
    superEdges.delete(edgeToRemove);

    /**
     * Doesn't contain [a, b] because it's already removed.
     */
    const edgesToMerge = [...superEdges.entries()]
      .map(
        ([edge, weight]) => [edge.split("-") as [Node, Node], weight] as const
      )
      .filter(([nodes]) => nodes.includes(a) || nodes.includes(b));

    // Remove the extra edges.
    for (const [nodes, weight] of edgesToMerge) {
      const [otherNode] = nodes.filter((node) => ![a, b].includes(node));
      const edgeKey = getEdgeKey(nodeToKeep, otherNode);
      const edgeToRemove = getEdgeKey(...nodes);
      if (edgeKey === edgeToRemove) {
        continue;
      } else {
        superEdges.delete(nodes.join("-") as Edge); // The nodes are already sorted.
        superEdges.set(edgeKey, (superEdges.get(edgeKey) ?? 0) + weight);
      }
    }
  };

  while (superNodes.size > 2) {
    const edgeIndex = Math.floor(
      Math.random() *
        [...superEdges.values()].reduce((acc, curr) => acc + curr, 0)
    );
    // console.log("superNodes", superNodes);
    // console.log("superEdges", superEdges);
    const edges = [...superEdges.entries()];
    let edge: Edge | null = null;
    let i = 0;
    let count = 0;
    while (!edge) {
      const [edgeCandidate, weight] = edges[i];
      if (edgeIndex < weight + count) {
        edge = edgeCandidate;
      } else {
        i++;
        count += weight;
      }
    }
    const [a, b] = edge.split("-") as [Node, Node];
    // console.log("edge", edge, "merge", a, b);
    mergeSuperNodes(a, b);
  }

  // console.log(superEdges);

  return {
    sizes: [...superNodes.values()] as [number, number],
    cut: [...superEdges.values()][0],
  };
};

let kargerResult: KargerResult | null = null;

let i = 0;

while (!kargerResult) {
  i++;
  if (!(i % 0)) {
    console.log("i", i);
  }
  // console.log("new try");
  const kargerResultCandidate = karger();
  // console.log("kargerResultCandidate", kargerResultCandidate);

  if (kargerResultCandidate.cut === 3) {
    kargerResult = kargerResultCandidate;
    break;
  }
}

console.log("kargerResult", kargerResult);

const result = kargerResult.sizes[0] * kargerResult.sizes[1];

console.log(result);
