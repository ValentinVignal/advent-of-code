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
      state: Array(5)
        .fill(springText)
        .join("?")
        .split("")
        .filter(Boolean) as SpringInput[],
      groups: Array(5)
        .fill(groupText)
        .join(",")
        .split(",")
        .filter(Boolean)
        .map(Number),
    };
  });

const countArrangements = (
  input: Input & {
    requiredChar?: Spring | null;
    unknownDamagedSprings: number;
    unknownSprings: number;
  }
): number => {
  if (!input.state.length) {
    if (input.groups.length) return 0;
    return 1;
  }

  const [first, ...rest] = input.state;
  const possibilities: Spring[] = first === "?" ? ["#", "."] : [first];
  let unknownSprings = input.unknownSprings;
  if (first === "?") {
    unknownSprings--;
  }
  return possibilities
    .filter((s) => {
      if (input.requiredChar && s !== input.requiredChar) return false;
      if (first === "?") {
        if (s === "#" && !input.unknownDamagedSprings) return false;
        if (s === "." && input.unknownSprings === input.unknownDamagedSprings)
          return false;
      }
      return true;
    })
    .map((s) => {
      switch (s) {
        case ".":
          return countArrangements({
            state: rest,
            groups: input.groups,
            unknownDamagedSprings: input.unknownDamagedSprings,
            unknownSprings,
          });
        case "#":
          if (!input.groups.length) return 0;
          let [group, ...restGroups] = input.groups;
          group--;
          let unknownDamagedSprings = input.unknownDamagedSprings;
          if (first === "?") {
            unknownDamagedSprings--;
          }
          if (group === 0) {
            return countArrangements({
              state: rest,
              groups: restGroups,
              requiredChar: ".",
              unknownDamagedSprings: unknownDamagedSprings,
              unknownSprings,
            });
          } else {
            return countArrangements({
              state: rest,
              groups: [group, ...restGroups],
              requiredChar: "#",
              unknownDamagedSprings: unknownDamagedSprings,
              unknownSprings,
            });
          }
      }
    })
    .reduce((acc, curr) => acc + curr, 0);
};

const result = inputs
  .map((input, i) => {
    console.log("i", i);
    const knownSprings = input.state.filter((s) => s === "#").length;
    const unknownSprings = input.state.filter((s) => s === "?").length;
    const totalSprings = input.groups.reduce((acc, curr) => acc + curr, 0);
    const unknownDamagedSprings = totalSprings - knownSprings;
    return countArrangements({
      ...input,
      unknownDamagedSprings,
      unknownSprings,
    });
  })
  .reduce((acc, curr) => acc + curr, 0);

console.log(result);
