import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const [orderText, updatesText] = textInput.split("\n\n");

type Order = {
  before: string;
  after: string;
};
const orders: Order[] = orderText.split("\n").map((line) => {
  const [before, after] = line.split("|");
  return { before, after };
});

type Update = string[];

const updates: Update[] = updatesText
  .split("\n")
  .map((line) => line.split(","));

const isInCorrectOrder = (update: Update): boolean => {
  const subOrders = orders.filter((order) => {
    return update.includes(order.before) && update.includes(order.after);
  });

  for (const subOrder of subOrders) {
    const beforeIndex = update.indexOf(subOrder.before);
    const afterIndex = update.indexOf(subOrder.after);
    if (beforeIndex > afterIndex) {
      return false;
    }
  }
  return true;
};

let result = 0;
for (const update of updates) {
  if (isInCorrectOrder(update)) {
    const middleElement = parseInt(update[Math.floor(update.length / 2)]);
    result += middleElement;
  }
}

// x != 5806
console.log(result); // 5991
