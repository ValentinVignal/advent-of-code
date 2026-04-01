import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const numbers = textInput.split("\n").filter(Boolean).map(Number);

const fuelForMass = (mass: number): number => {
  const fuel = Math.floor(mass / 3) - 2;
  if (fuel <= 0) return 0;
  return fuel + fuelForMass(fuel);
};

const result = numbers.map(fuelForMass).reduce((a, b) => a + b, 0);

console.log(result); // 5055050
