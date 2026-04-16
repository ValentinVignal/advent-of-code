import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Unit = {
  id: string;
  amount: number;
};

type Reaction = {
  inputs: Unit[];
  output: Unit;
};

const reactions: Reaction[] = textInput.split("\n").map((row) => {
  const [inputsText, outputText] = row.split(" => ");
  const [amountText, id] = outputText.split(" ");

  const inputs = inputsText.split(", ").map((text) => {
    const [amountText, id] = text.split(" ");
    return {
      id,
      amount: Number(amountText),
    };
  });

  return {
    inputs,
    output: {
      id,
      amount: Number(amountText),
    },
  };
});

const reactionMap = new Map<string, Reaction>();

for (const reaction of reactions) {
  reactionMap.set(reaction.output.id, reaction);
}

const maxDepths = new Map<string, number>();

const findDepths = (id: string, currentDepth: number): void => {
  maxDepths.set(id, Math.max(currentDepth, maxDepths.get(id) ?? 0));

  const reaction = reactionMap.get(id);

  if (!reaction) return;

  for (const input of reaction.inputs) {
    findDepths(input.id, currentDepth + 1);
  }
};

findDepths("FUEL", 0);

type Item = {
  id: string;
  depth: number;
};

const findRequiredOre = (target: number): number => {
  const queue: Item[] = [{ id: "FUEL", depth: 0 }];

  const amountMap = new Map<string, number>([["FUEL", target]]);

  const visited = new Set<string>();

  const getNext = (): Item => {
    const min = Math.min(...queue.map((item) => item.depth));
    const index = queue.findIndex((item) => item.depth === min);
    const [next] = queue.splice(index, 1);
    return next;
  };

  while (queue.length) {
    const node = getNext();

    if (node.id === "ORE") {
      continue;
    }
    if (visited.has(node.id)) {
      continue;
    }

    const reaction = reactionMap.get(node.id)!;
    const amount = amountMap.get(node.id)!;
    const multiplier = Math.ceil(amount / reaction.output.amount);

    for (const input of reaction.inputs) {
      amountMap.set(
        input.id,
        (amountMap.get(input.id) ?? 0) + input.amount * multiplier,
      );
    }

    queue.push(
      ...reaction.inputs.map((input) => ({
        id: input.id,
        depth: maxDepths.get(input.id)!,
      })),
    );

    visited.add(node.id);
  }
  return amountMap.get("ORE")!;
};

const findFuelAmount = (): number => {
  const oreStock = 1000000000000;

  // Do a binary search.

  let high = 2 ** Math.ceil(Math.log2(oreStock / findRequiredOre(1)));
  let low = high / 2;

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const requiredOre = findRequiredOre(mid);
    if (requiredOre > oreStock) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return low;
};

const result = findFuelAmount();

console.log(result); // 1993284
