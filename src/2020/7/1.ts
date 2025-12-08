import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Bag = {
  id: string;
  children: { id: string; count: number }[];
};

type BagWithParent = Bag & {
  parents: string[];
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

const tree = new Map<string, BagWithParent>();

for (const bag of bags) {
  if (!tree.has(bag.id)) {
    tree.set(bag.id, { ...bag, parents: [] });
  } else {
    const existing = tree.get(bag.id)!;
    tree.set(bag.id, { ...existing, children: bag.children });
  }

  for (const child of bag.children) {
    if (!tree.has(child.id)) {
      tree.set(child.id, { id: child.id, children: [], parents: [bag.id] });
    } else {
      const existing = tree.get(child.id)!;
      tree.set(child.id, {
        ...existing,
        parents: [...existing.parents, bag.id],
      });
    }
  }
}

const findAllParents = (seen: Set<string>, toSee: string[]): Set<string> => {
  if (toSee.length === 0) {
    return seen;
  }
  const next = toSee[0];
  if (seen.has(next)) {
    return findAllParents(seen, toSee.slice(1));
  }
  const parents = tree.get(next)!.parents;
  return findAllParents(new Set([...seen, next]), [
    ...toSee.slice(1),
    ...parents,
  ]);
};

const allParents = findAllParents(new Set(), tree.get("shiny gold")!.parents);

const result = allParents.size;

console.log(allParents);

console.log(result); // 238
