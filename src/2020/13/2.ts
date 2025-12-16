import { readFileSync } from "fs";
import * as path from "path";

const example = 0;

const textInput = readFileSync(
  path.join(
    __dirname,
    `input${example ? `-example${example > 1 ? `-${example}` : ""}` : ""}.txt`
  ),
  "utf-8"
);

const busesText = textInput.split("\n")[1];

const buses = busesText
  .split(",")
  .map((bus, index) => ({
    bus,
    delta: index,
  }))
  .filter((item) => item.bus !== "x")
  .map((item) => ({
    id: parseInt(item.bus),
    delta: item.delta,
  }));

console.log(buses);

const n = buses.reduce((acc, bus) => acc * bus.id, 1);

const b = buses.map((bus) => {
  return ((-bus.delta % bus.id) + bus.id) % bus.id;
});

for (const [index, bus] of buses.entries()) {
  console.log(`t ≡ ${b[index]} (mod ${bus.id})`);
}

const ns = buses.map((bus) => n / bus.id);

const x = buses.map((bus, index) => {
  const ni = ns[index];
  let xi = 1;
  while ((ni * xi) % bus.id !== 1) {
    xi++;
  }
  return xi;
});

const sum = buses.map((_, index) => {
  return b[index] * ns[index] * x[index];
});

const result = sum.reduce((acc, val) => (acc + val) % n, 0) % n;

console.log(n);

// x < 327300950120048 < 327300950120049
console.log(result); // 327300950120029
