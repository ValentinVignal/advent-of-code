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
  const subOrders = orders.filter((order) => {
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

  // These 2 should old all the pages that are in the update or else the answer
  // wouldn't be unique.
  const allBefores = subOrders.map((order) => order.before);
  const allAfters = subOrders.map((order) => order.after);

  const beforeCounts = allBefores.reduce((acc, page) => {
    return acc.set(page, acc.get(page) ?? 0 + 1);
  }, new Map<string, number>());
  const afterCounts = allAfters.reduce((acc, page) => {
    return acc.set(page, acc.get(page) ?? 0 + 1);
  }, new Map<string, number>());

  const allBeforeSorted = allBefores.filter(
    (value, index, array) => array.indexOf(value) === index
  );
  allBeforeSorted.sort((a, b) => beforeCounts.get(a)! - beforeCounts.get(b)!);
  const allAftersSorted = allAfters.filter(
    (value, index, array) => array.indexOf(value) === index
  );
  allAftersSorted.sort((a, b) => afterCounts.get(b)! - afterCounts.get(a)!);

  const dummyOrder = [...allBefores, ...allAfters]
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort((a, b) => {
      if (subOrders.find((order) => order.before === a && order.after === b)) {
        return 1;
      } else if (
        subOrders.find((order) => order.before === b && order.after === a)
      ) {
        return -1;
      }
      return 0;
    });

  const order = (current: Update): Update | null => {
    const subSubOrders = subOrders.filter((order) => {
      return current.includes(order.before) && current.includes(order.after);
    });
    for (const order of subSubOrders) {
      const beforeIndex = current.indexOf(order.before);
      const afterIndex = current.indexOf(order.after);
      if (beforeIndex > afterIndex) {
        return null;
      }
    }
    if (current.length === update.length) return current;
    const potentialNewPages = dummyOrder.filter(
      (page) => !current.includes(page)
    );
    for (const page of potentialNewPages) {
      const newUpdate = order([...current, page]);
      if (newUpdate) {
        return newUpdate;
      }
    }
    return null;
  };

  const orderedUpdate = order([])!;
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

// x != 5806
console.log(result); // 5991
