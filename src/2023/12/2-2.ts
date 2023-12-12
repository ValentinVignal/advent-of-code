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
  input: Input & { requiredChar?: Spring | null }
): number => {
  if (!input.state.length) {
    if (input.groups.length) return 0;
    return 1;
  }

  const [first, ...rest] = input.state;
  const possibilities: Spring[] = first === "?" ? ["#", "."] : [first];
  return possibilities
    .filter((s) => !input.requiredChar || s === input.requiredChar)
    .map((s) => {
      switch (s) {
        case ".":
          return countArrangements({
            state: rest,
            groups: input.groups,
          });
        case "#":
          if (!input.groups.length) return 0;
          let [group, ...restGroups] = input.groups;
          group--;
          if (group === 0) {
            return countArrangements({
              state: rest,
              groups: restGroups,
              requiredChar: ".",
            });
          } else {
            return countArrangements({
              state: rest,
              groups: [group, ...restGroups],
              requiredChar: "#",
            });
          }
      }
    })
    .reduce((acc, curr) => acc + curr, 0);
};

const result = inputs
  .map((input, i) => {
    console.log("i", i);
    return countArrangements(input);
  })
  .reduce((acc, curr) => acc + curr, 0);

console.log(result);
