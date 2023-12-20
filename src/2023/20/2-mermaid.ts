import { readFileSync, writeFileSync } from "fs";
import * as path from "path";

// Creates the `input-mermaid.txt` file which is used to paste in
// https://mermaid.live/ to visualize the graph.

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

let mermaidInput: string[] = [];

textInput
  .split("\n")
  .filter(Boolean)
  .forEach((line) => {
    const [typeString, destinationsString] = line.split(" -> ");
    const destinations = destinationsString.split(", ");
    let name = typeString.slice(1);
    for (const destination of destinations) {
      mermaidInput.push(`  ${name}[${typeString}] --> ${destination}`);
    }
  });

writeFileSync(
  path.join(__dirname, "input-mermaid.txt"),
  mermaidInput.join("\n"),
  "utf-8"
);
