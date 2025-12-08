import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Bag = {
  id: string;
  children: { id: string; count: number }[];
};

const bags: Bag[] = textInput.split("\n").map((line) => {
  const [id, childrenString] = line.split(" bags contain ");
  const children = childrenString
    .split(", ")
    .map((child) => {
      if (child === "no other bags.") {
        return null;
      }
      const match = child.match(/^(\d+) (.+?) bags?/)!;
      return { id: match[2], count: Number(match[1]) };
    })
    .filter(Boolean) as { id: string; count: number }[];
  return {
    id: id,
    children: children,
  };
});

const tree = new Map<string, Bag>(bags.map((bag) => [bag.id, bag]));

const countAllBags = (bagId: string): number => {
  const bag = tree.get(bagId)!;
  return bag.children.reduce((sum, child) => {
    return sum + child.count * (1 + countAllBags(child.id));
  }, 0);
};

const result = countAllBags("shiny gold");

console.log(result); // 82930
