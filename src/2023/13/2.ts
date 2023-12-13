import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Char = "." | "#";

type Pattern = Char[][];

const patterns = textInput
  .split("\n\n")
  .filter(Boolean)
  .map((patternText) => {
    return patternText
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split("").filter(Boolean) as Char[]);
  });

const arrayEquals = <T>(a: T[], b: T[]): boolean => {
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

const hasRowMirror = (pattern: Pattern, index: number): boolean => {
  const maxDx = Math.min(index + 1, pattern.length - index - 1);

  return Array.from({ length: maxDx }, (_, i) => i).every((i) => {
    return arrayEquals(pattern[index - i], pattern[index + 1 + i]);
  });
};

const hasColumnMirror = (pattern: Pattern, index: number): boolean => {
  const maxDx = Math.min(index + 1, pattern[0].length - index - 1);

  return Array.from({ length: maxDx }, (_, i) => i).every((i) => {
    return arrayEquals(
      pattern.map((line) => line[index - i]),
      pattern.map((line) => line[index + 1 + i])
    );
  });
};

type MirrorLocation =
  | { row: number; column: null }
  | { row: null; column: number };

const getMirrorLocation = (pattern: Pattern): MirrorLocation[] => {
  const locations = [];
  for (let index = 0; index < pattern[0].length - 1; index++) {
    if (hasColumnMirror(pattern, index)) {
      locations.push({ row: null, column: index });
    }
  }
  for (let index = 0; index < pattern.length - 1; index++) {
    if (hasRowMirror(pattern, index)) {
      locations.push({ row: index, column: null });
    }
  }
  return locations;
};

const mirrorLocationEqual = (a: MirrorLocation, b: MirrorLocation): boolean => {
  return a.row === b.row && a.column === b.column;
};

// cspell:ignore mudge
const fixMudge = (pattern: Pattern, row: number, column: number): Pattern => {
  return pattern.map((line, rowIndex) => {
    return line.map((char, columnIndex) => {
      if (rowIndex === row && columnIndex === column) {
        switch (char) {
          case "#":
            return ".";
          case ".":
            return "#";
        }
      }
      return char;
    });
  });
};

const mirrorLocationValue = (location: MirrorLocation): number => {
  if (location.column !== null) {
    return location.column + 1;
  }
  return 100 * (location.row! + 1);
};

const values = patterns.map((pattern, i) => {
  const initialMirrorLocation = getMirrorLocation(pattern)[0];

  for (let x = 0; x < pattern.length; x++) {
    for (let y = 0; y < pattern[0].length; y++) {
      const fixedPattern = fixMudge(pattern, x, y);
      const mirrorLocations = getMirrorLocation(fixedPattern);
      const newMirrorLocation = mirrorLocations.find(
        (location) => !mirrorLocationEqual(location, initialMirrorLocation)
      );
      if (newMirrorLocation) {
        return mirrorLocationValue(newMirrorLocation);
      }
    }
  }
  throw new Error("No solution found for pattern" + i);
});

const result = values.reduce((acc, value) => acc + value, 0);

console.log(result); // 42695
