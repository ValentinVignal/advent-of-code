import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Spring = "." | "#";

type SpringInput = Spring | "?";

type Input = {
  state: SpringInput[];
  groups: number[];
};

const inputs: Input[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [springText, groupText] = line.split(" ");
    return {
      state: springText.split("").filter(Boolean) as SpringInput[],
      groups: groupText.split(",").map(Number).filter(Boolean),
    };
  });

const fillSpring = (spring: SpringInput[]): Spring[][] => {
  const possibilities: Spring[][] = [];

  const fill = (current: Spring[]): void => {
    if (current.length === spring.length) {
      possibilities.push(current);
      return;
    }
    const s = spring[current.length];
    if (s !== "?") {
      fill([...current, s]);
      return;
    }
    fill([...current, "."]);
    fill([...current, "#"]);
  };

  fill([]);

  return possibilities;
};

const springToGroup = (spring: Spring[]): number[] => {
  let last: Spring | null = null;
  const groups: number[] = [];
  for (const s of spring) {
    if (s === last) {
      if (s === "#") {
        groups[groups.length - 1]++;
      }
    } else if (s === "#") {
      groups.push(1);
    }
    last = s;
  }
  return groups;
};

const groupEquals = (a: number[], b: number[]): boolean => {
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

const arrangementNumber: number[] = inputs.map((input) => {
  const possibilities = fillSpring(input.state);
  return possibilities
    .map((possibility) => springToGroup(possibility))
    .filter((groups) => groupEquals(groups, input.groups)).length;
});

const result = arrangementNumber.reduce((a, b) => a + b, 0);

// x < 7640
console.log(result); // 7633
