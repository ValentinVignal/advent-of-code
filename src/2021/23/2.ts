import { readFileSync } from "fs";
import * as path from "path";

type Amphipod = "A" | "B" | "C" | "D";

type ID = number;

type Optional<T> = T | null;

/**
 * 0: bottom
 * 1: top.
 */
type Door = [Optional<ID>, Optional<ID>, Optional<ID>, Optional<ID>];
type Doors = [Door, Door, Door, Door];

const doors: Doors = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
];

const doorDepth = 4 as const;

type Hallway = Optional<ID>[];
const hallway: Optional<ID>[] = [...Array.from({ length: 11 }, () => null)];

const textInput = readFileSync(path.join(__dirname, "input-2.txt"), "utf-8");

const doorIndexes = [2, 4, 6, 8] as const;
const amphipods = ["A", "B", "C", "D"] as const;
const idMap = new Map<ID, Amphipod>();

let id = 1;

textInput
  .split("\n")
  .filter(Boolean)
  .slice(2, 6)
  .forEach((line, lineIndex) => {
    const cells = line.split("");
    for (const [i, doorIndex] of doorIndexes.entries()) {
      const amphipod = cells[doorIndex + 1];
      if (amphipod === " ") continue;

      const amphipodId = id++;
      doors[i][doorDepth - 1 - lineIndex] = amphipodId;
      idMap.set(amphipodId, amphipod as Amphipod);
    }
  });

const ids = [...idMap.keys()] as ID[];

type State = {
  doors: Doors;
  hallway: Hallway;
  energy: number;
  previousStates?: Omit<State, "previousStates">[];
};

const enabledPrint = false;
const includePreviousState = true;

const state: State = {
  doors,
  hallway,
  energy: 0,
  previousStates: includePreviousState ? [] : undefined,
};

const stateToString = (
  state: Pick<State, "doors" | "hallway" | "previousStates">
): string => {
  const getStateLines = (state: Pick<State, "doors" | "hallway">): string[] => [
    state.hallway
      .map((slot) => (slot ? `${slot} `.slice(0, 2) : "  "))
      .join(""),
    ...[0, 1, 2, 3]
      .map((i) =>
        state.doors
          .map((door) => door[doorDepth - 1 - i])
          .map((v) => (v ? `${v} `.slice(0, 2) : ". "))
          .join("  ")
      )
      .map((line) => `    ${line}    `),
  ];

  const blocks = [...(state.previousStates ?? []), state].map(getStateLines);

  return blocks.map((block) => block.join("\n")).join("\n        ->\n");
};

const queue = [state];

const stateToHash = (state: State): string => {
  return `${state.doors
    .map((door) => door.map((i) => i ?? "").join(","))
    .join(",")}${state.hallway.map((i) => i ?? "").join(",")}`;
};

const states = new Map<string, number>();

type DoorIndex = (typeof doorIndexes)[number];

const amphipodToDoorIndexInHallway = (amphipod: Amphipod): DoorIndex => {
  return doorIndexes[amphipods.indexOf(amphipod)];
};

let bestEnergy = Number.MAX_SAFE_INTEGER;
let bestState: Optional<State> = null;

const updateBestEnergy = (state: State): void => {
  if (
    state.doors.every((door, doorIndex) =>
      door.every(
        (slot) => slot && doorIndex === amphipods.indexOf(idMap.get(slot)!)
      )
    )
  ) {
    if (bestEnergy > state.energy) {
      bestEnergy = state.energy;
      bestState = state;
    }
  }
};

let i = 0;

const isDoorReady = (door: Door, amphipod: Amphipod): boolean =>
  door.every((slot) => !slot || idMap.get(slot) === amphipod);

const firstFreeIndexInDoor = (door: Door): number => {
  return door.indexOf(null);
};

while (queue.length) {
  i++;
  const state = queue.shift()!;
  if (!(i % 100000)) {
    console.log(queue.length);
    console.log(stateToString(state));
  }
  if (state.energy > bestEnergy) continue;
  const hash = stateToHash(state);
  const existingEnergy = states.get(hash);
  if (existingEnergy !== undefined && existingEnergy <= state.energy) {
    continue;
  }
  states.set(hash, state.energy);
  if (enabledPrint) {
    console.log(stateToString(state));
  }
  updateBestEnergy(state);

  for (const id of ids) {
    const label = idMap.get(id)!;
    /** Door index in the doors object. */
    const correctDoorIndex = amphipods.indexOf(label) as 0 | 1 | 2 | 3;
    const energyDelta = 10 ** correctDoorIndex;
    const newState: State = structuredClone(state);
    newState.previousStates?.push({
      ...state,
      // @ts-ignore
      previousStates: undefined,
    });
    if (newState.hallway.includes(id)) {
      // It needs to move to its door right away.
      const doorIsReady = isDoorReady(newState.doors[correctDoorIndex], label);
      if (!doorIsReady) {
        continue;
      }

      const doorIndexInHallway = amphipodToDoorIndexInHallway(label);
      const currentIndex = newState.hallway.indexOf(id);
      let isHallwayFree = true;
      for (
        let i = Math.min(doorIndexInHallway, currentIndex);
        i <= Math.max(doorIndexInHallway, currentIndex);
        i++
      ) {
        if (i === currentIndex) continue;
        if (state.hallway[i]) {
          isHallwayFree = false;
          break;
        }
      }
      if (!isHallwayFree) {
        continue;
      }
      const indexInDoor = firstFreeIndexInDoor(
        newState.doors[correctDoorIndex]
      );
      // TODO continue
      const distance =
        Math.abs(doorIndexInHallway - currentIndex) + (doorDepth - indexInDoor);
      newState.energy += distance * energyDelta;
      newState.hallway[currentIndex] = null;
      newState.doors[correctDoorIndex][indexInDoor] = id;
      queue.push(newState);
    } else {
      // It is in a door.
      const isInCorrectDoor = newState.doors[correctDoorIndex].includes(id);
      if (isInCorrectDoor) {
        const indexInDoor = newState.doors[correctDoorIndex].indexOf(id);
        if (
          newState.doors[correctDoorIndex]
            .slice(0, indexInDoor)
            .every((slot) => idMap.get(slot!) === label)
        ) {
          // It is in the correct door at the correct place.
          continue;
        }
      }
      // It needs to move out.
      const currentDoorIndex = newState.doors.findIndex((door) =>
        door.includes(id)
      );
      const currentIndexInDoor = newState.doors[currentDoorIndex].indexOf(id);
      const currentDoorIndexInHallway = doorIndexes[currentDoorIndex];
      if (
        newState.doors[currentDoorIndex]
          .slice(currentIndexInDoor + 1)
          .some((slot) => slot)
      ) {
        // There is another amphipod in the way to come out the door.
        continue;
      }
      newState.doors[currentDoorIndex][currentIndexInDoor] = null;
      for (let i = currentDoorIndexInHallway; i < hallway.length; i++) {
        if (newState.hallway[i]) {
          break;
        }
        if (doorIndexes.includes(i as any)) {
          continue;
        }
        const movedState = structuredClone(newState);
        movedState.hallway[i] = id;
        movedState.energy +=
          (i - currentDoorIndexInHallway + (doorDepth - currentIndexInDoor)) *
          energyDelta;
        queue.push(movedState);
      }
      for (let j = currentDoorIndexInHallway; j >= 0; j--) {
        if (newState.hallway[j]) {
          break;
        }
        if (doorIndexes.includes(j as any)) {
          continue;
        }
        const movedState = structuredClone(newState);
        movedState.hallway[j] = id;
        movedState.energy +=
          (currentDoorIndexInHallway - j + (doorDepth - currentIndexInDoor)) *
          energyDelta;
        queue.push(movedState);
      }
    }
  }
}

console.log(bestEnergy); // 53751
console.log(stateToString(bestState!));
console.log(i);
