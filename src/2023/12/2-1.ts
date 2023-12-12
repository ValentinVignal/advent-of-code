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
      state: Array(1)
        .fill(springText)
        .join("?")
        .split("")
        .filter(Boolean) as SpringInput[],
      groups: Array(1)
        .fill(groupText)
        .join(",")
        .split(",")
        .filter(Boolean)
        .map(Number),
    };
  });

const groupEquals = (a: number[], b: number[]): boolean => {
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

const fillSpring = (input: Input): Spring[][] => {
  const possibilities: Spring[][] = [];
  const spring = input.state;

  const fill = (current: Spring[]): void => {
    const currentGroup = springToGroup(current);
    const groupIncludes = (): boolean => {
      const a = current;
      const b = spring;
      if (a.length > b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (i === a.length - 1) {
          if (a[i] > b[i]) {
            return false;
          } else if (a[i] < b[i]) {
            return spring[spring.length - 1] === "#";
          }
        }
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    };

    if (!groupIncludes()) {
      return;
    }

    if (current.length === spring.length) {
      possibilities.push(current);
      return;
    }

    const s = spring[current.length];
    const prevS = current.length ? current[current.length - 1] : null;
    for (const nextS of s === "?" ? ["#", "."] : [s]) {
      if (nextS === "#") {
        if (prevS === "#") {
          if (
            currentGroup[currentGroup.length - 1] <
            input.groups[currentGroup.length - 1]
          ) {
            fill([...current, nextS]);
          }
        } else {
          if (
            !currentGroup.length ||
            currentGroup[currentGroup.length - 1] ===
              input.groups[currentGroup.length - 1]
          ) {
            fill([...current, nextS]);
          }
        }
      } else {
        // nextS === "."
        if (prevS === "#") {
          if (
            currentGroup[currentGroup.length - 1] <
            input.groups[currentGroup.length - 1]
          ) {
            continue;
          }
        }
        fill([...current, nextS as "."]);
      }
    }
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

const arrangementNumber: number[] = inputs.map((input, i) => {
  const possibilities = fillSpring(input);
  console.log("input", i / 10, "%");
  return possibilities
    .map((possibility) => {
      return springToGroup(possibility);
    })
    .filter((groups) => {
      return groupEquals(groups, input.groups);
    }).length;
});

const result = arrangementNumber.reduce((a, b) => a + b, 0);

console.log(result); // 7633
