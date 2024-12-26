import { readFileSync } from "fs";
import * as path from "path";

// https://en.wikipedia.org/wiki/Clique_problem
// https://en.wikipedia.org/wiki/Complete_graph
// https://en.wikipedia.org/wiki/Bron%E2%80%93Kerbosch_algorithm

// cspell:ignore bron Kerbosch

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Connection = [string, string];

const input: Connection[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split("-") as Connection;
  });

const connectionMap = new Map<string, Set<string>>();

for (const connection of input) {
  for (const computer of connection) {
    if (!connectionMap.has(computer)) {
      connectionMap.set(computer, new Set());
    }
    connectionMap
      .get(computer)!
      .add(connection[0] === computer ? connection[1] : connection[0]);
  }
}

const maximalCliques: string[][] = [];

const bronKerbosch = (r: Set<string>, p: Set<string>, x: Set<string>): void => {
  if (!p.size && !x.size) {
    maximalCliques.push([...r]);
    return;
  }
  for (const v of p) {
    bronKerbosch(
      new Set([...r, v]),
      new Set([...p].filter((neighbor) => connectionMap.get(v)!.has(neighbor))),
      new Set([...x].filter((neighbor) => connectionMap.get(v)!.has(neighbor)))
    );
    p.delete(v);
    x.add(v);
  }
};

bronKerbosch(new Set(), new Set(connectionMap.keys()), new Set());

maximalCliques.sort((a, b) => b.length - a.length);

const password = maximalCliques[0].sort().join(",");

console.log(password); // ad,jw,kt,kz,mt,nc,nr,sb,so,tg,vs,wh,yh
