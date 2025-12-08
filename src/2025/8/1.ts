import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Position = {
  x: number;
  y: number;
  z: number;
};

type PositionID = `${number},${number},${number}`;
const positionToID = (position: Position): PositionID => {
  return `${position.x},${position.y},${position.z}`;
};
const positionFromID = (id: PositionID): Position => {
  const [x, y, z] = id.split(",").map(Number);
  return { x, y, z };
};

const positions: Position[] = textInput.split("\n").map((line) => {
  return positionFromID(line as PositionID);
});

type Connection = {
  from: Position;
  to: Position;
  distance: number;
};

const connections: Connection[] = positions.flatMap((from, indexFrom) =>
  positions.slice(indexFrom + 1).map((to) => {
    const distance =
      Math.pow(to.x - from.x, 2) +
      Math.pow(to.y - from.y, 2) +
      Math.pow(to.z - from.z, 2);
    return { from, to, distance };
  })
);

connections.sort((a, b) => a.distance - b.distance);

const circuits = positions.map((position) => {
  return [positionToID(position)];
});

const connect = (connection: Connection): void => {
  const fromID = positionToID(connection.from);
  const toID = positionToID(connection.to);

  const fromCircuitIndex = circuits.findIndex((circuit) =>
    circuit.includes(fromID)
  );
  const toCircuitIndex = circuits.findIndex((circuit) =>
    circuit.includes(toID)
  );
  if (fromCircuitIndex === toCircuitIndex) {
    return;
  }

  const minIndex = Math.min(fromCircuitIndex, toCircuitIndex);
  const maxIndex = Math.max(fromCircuitIndex, toCircuitIndex);
  const fromCircuit = circuits[minIndex];
  const toCircuit = circuits[maxIndex];

  // Merge circuits
  circuits[minIndex] = [...fromCircuit, ...toCircuit];
  circuits.splice(maxIndex, 1);
};

for (const connection of connections.slice(0, example ? 10 : 1000)) {
  connect(connection);
}

console.log(circuits.slice(0, 3));

circuits.sort((a, b) => b.length - a.length);

const result = circuits
  .slice(0, 3)
  .reduce((acc, circuit) => acc * circuit.length, 1);

console.log("Result:", result); // 68112
