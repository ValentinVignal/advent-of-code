import { readFileSync } from "fs";
import * as path from "path";

const example = true;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const blocksTextInput = textInput.split("\n\n");

type ShapeLine = [boolean, boolean, boolean];
type Shape = [ShapeLine, ShapeLine, ShapeLine];

const regionsTextInput = blocksTextInput[blocksTextInput.length - 1];
const shapesTextInput = blocksTextInput.slice(0, -1);

/** The shape of the presents from the input */
const shapes: Shape[] = shapesTextInput.map((shapeText) => {
  return shapeText
    .split("\n")
    .slice(1)
    .map(
      (line) => line.split("").map((char) => char === "#") as ShapeLine
    ) as Shape;
});

type Region = {
  width: number;
  height: number;
  presents: number[];
};

const regions = regionsTextInput.split("\n").map((line) => {
  const [sizePart, presentsPart] = line.split(": ");
  const [width, height] = sizePart.split("x").map(Number);
  const presents = presentsPart.split(" ").map(Number);
  return { width, height, presents } as Region;
});

const shapeToString = (shape: Shape): string => {
  return shape
    .map((line) => line.map((cell) => (cell ? "#" : ".")).join(""))
    .join("\n");
};

const rotateShape = (shape: Shape): Shape => {
  return [
    [shape[2][0], shape[1][0], shape[0][0]],
    [shape[2][1], shape[1][1], shape[0][1]],
    [shape[2][2], shape[1][2], shape[0][2]],
  ];
};

const flipXShape = (shape: Shape): Shape => {
  return [
    [shape[0][2], shape[0][1], shape[0][0]],
    [shape[1][2], shape[1][1], shape[1][0]],
    [shape[2][2], shape[2][1], shape[2][0]],
  ];
};

const flipYShape = (shape: Shape): Shape => {
  return [
    [shape[2][0], shape[2][1], shape[2][2]],
    [shape[1][0], shape[1][1], shape[1][2]],
    [shape[0][0], shape[0][1], shape[0][2]],
  ];
};

/**
 * The shapes form the input. But it also contains all its possible rotations
 * and flips. It also removed duplicates.
 */
const shapesWithRotations = shapes.map((shape) => {
  const shapes: Shape[] = [shape];
  let rotatedShape = shape;
  for (let i = 0; i < 3; i++) {
    rotatedShape = rotateShape(rotatedShape);
    shapes.push(rotatedShape);
    let flippedXShape = flipXShape(rotatedShape);
    shapes.push(flippedXShape);
    let flippedYShape = flipYShape(rotatedShape);
    shapes.push(flippedYShape);
    let flippedXYShape = flipYShape(flippedXShape);
    shapes.push(flippedXYShape);
  }
  return shapes.filter((shape, index, array) => {
    const shapeString = shapeToString(shape);
    return array.findIndex((s) => shapeToString(s) === shapeString) === index;
  });
});

type Position = { x: number; y: number };

const positionToString = (position: Position): string =>
  `${position.x},${position.y}`;

const canRegionFitAllThePresents = (region: Region): boolean => {
  /**
   * When placing the n-th present ( {@link indexInList} ) in the region, this
   * function returns the index in the input list of presents (
   * {@link indexInInput} ) that corresponds to the n-th present in the region.
   * It basically returns the index shape of the present.
   */
  const getPresentIndexInInputFromIndexInList = (
    indexInList: number
  ): number => {
    let indexInInput = 0;
    for (const presentIndexInInput of region.presents) {
      if (presentIndexInInput < indexInList) {
        indexInInput++;
        indexInList -= presentIndexInInput;
      } else {
        return indexInInput;
      }
    }
    return indexInInput;
  };

  type State = {
    presentIndexInList: number;
    currentRegion: string[];
  };

  const stateToString = (state: State): string => {
    return `${state.presentIndexInList}|${state.currentRegion.join(";")}`;
  };

  const cache: string[] = [];

  const canRegionFitAllThePresentsRecursive = ({
    presentIndexInList,
    currentRegion,
  }: State): boolean => {
    const stateId = stateToString({ presentIndexInList, currentRegion });
    if (cache.includes(stateId)) {
      return false;
    }

    const presentId = getPresentIndexInInputFromIndexInList(presentIndexInList);
    const shapeVariants = shapesWithRotations[presentId];

    for (const shape of shapeVariants) {
      for (let y = 0; y <= region.height - 3; y++) {
        for (let x = 0; x <= region.width - 3; x++) {
          const occupiedPositions: Position[] = [];
          for (let shapeY = 0; shapeY < 3; shapeY++) {
            for (let shapeX = 0; shapeX < 3; shapeX++) {
              if (shape[shapeY][shapeX]) {
                occupiedPositions.push({ x: x + shapeX, y: y + shapeY });
              }
            }
          }
          const occupiedPositionsString =
            occupiedPositions.map(positionToString);
          const canPlaceShape = occupiedPositionsString.every(
            (positionString) => {
              return !currentRegion.includes(positionString);
            }
          );
          if (!canPlaceShape) {
            continue;
          }

          const newRegion = [
            ...currentRegion,
            ...occupiedPositionsString,
          ].sort();
          if (
            canRegionFitAllThePresentsRecursive({
              presentIndexInList: presentIndexInList + 1,
              currentRegion: newRegion,
            })
          ) {
            return true;
          }
        }
      }
    }
    cache.push(stateId);
    return false;
  };

  return canRegionFitAllThePresentsRecursive({
    presentIndexInList: 0,
    currentRegion: [],
  });
};

const result = regions.filter(canRegionFitAllThePresents).length;

console.log(result);
