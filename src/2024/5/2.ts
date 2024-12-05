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

const orderCorrectly = (update: Update): Update | null => {
  let subOrders = orders.filter((order) => {
    return update.includes(order.before) && update.includes(order.after);
  });

  let isCorrectlyOrdered = true;
  for (const subOrder of subOrders) {
    const beforeIndex = update.indexOf(subOrder.before);
    const afterIndex = update.indexOf(subOrder.after);
    if (beforeIndex > afterIndex) {
      isCorrectlyOrdered = false;
      break;
    }
  }
  if (isCorrectlyOrdered) return null;

  // The update is not correctly ordered

  const orderedUpdate: Update = [];
  let toConsume = [...update];
  while (toConsume.length) {
    const onlyInBefore = toConsume.find((page) => {
      return !subOrders.some((order) => order.after === page);
    })!;

    orderedUpdate.push(onlyInBefore);
    toConsume = toConsume.filter((page) => page !== onlyInBefore);
    subOrders = subOrders.filter((order) => order.before !== onlyInBefore);
  }

  return orderedUpdate;
};

let result = 0;
let i = 0;
for (const update of updates) {
  console.log(i++, "/", updates.length);
  const newUpdate = orderCorrectly(update);
  if (!newUpdate) continue;
  const middleElement = parseInt(newUpdate[Math.floor(newUpdate.length / 2)]);
  result += middleElement;
}

console.log(result); // 5479
