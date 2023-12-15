import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Position = { x: number; y: number; z: number };

const positionToString = (position: Position): string => {
  return `${position.x},${position.y},${position.z}`;
};

const scans: Position[][] = textInput
  .split("\n\n")
  .filter(Boolean)
  .map((scannerText) => {
    return scannerText
      .split("\n")
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        const [x, y, z] = line.split(",").filter(Boolean).map(Number);
        return { x, y, z };
      });
  });

/**
 * The scanners. The key is the id/index, the value is the position.
 *
 * The first scanner (index `0`), is at the position `{ x: 0, y: 0, z: 0 }`.
 */
const scanners = new Map<number, Position>();

scanners.set(0, { x: 0, y: 0, z: 0 });

/**
 * The scanners to place.`
 */
const scannersToPlace = Array.from(
  { length: scans.length - 1 },
  (_, i) => i + 1
);

/**
 * The scans of the scanners that are already placed.
 */
const placedScans = new Map<number, Position[]>();
placedScans.set(0, scans[0]);

/**
 * Rotates around the z axis.
 */
const turn = (position: Position): Position => {
  return {
    x: -position.y,
    y: position.x,
    z: position.z,
  };
};

/**
 *
 * Rotates the 90° away, so the away-face becomes the bottom face and the near
 * face the top.
 */
const roll = (position: Position): Position => {
  return {
    x: position.x,
    y: position.z,
    z: -position.y,
  };
};

// cspell:ignore RTTTRTTTRTTT
/**
 * A die (half a pair of dice) is handy for observing the 24 different
 * orientations.
 *
 * Anyhow, if you place the die with 1 on the near face, 2 at right, and 3 on
 * top, you will find that the following sequence of steps generates the twelve
 * different orientations with 1, 2, or 3 spots on top: `RTTTRTTTRTTT`. Then the
 * sequence `RTR` exposes 6, 4, 5 where 1, 2, 3 originally were, and a repeat of
 * the sequence `RTTTRTTTRTTT` generates the twelve orientations with 4, 5, or 6
 * spots on top.
 *
 * https://stackoverflow.com/a/16467849/12066144
 */
const sequenceToVisitAllFacesOfADice = [
  // The twelve different orientations with 1, 2, or 3 spots on top.
  roll,
  turn,
  turn,
  turn,
  roll,
  turn,
  turn,
  turn,
  roll,
  turn,
  turn,
  turn,
  // Exposes 6, 4, 5 where 1, 2, 3 originally were.
  roll,
  turn,
  roll,
  // Generates the twelve orientations with 4, 5, or 6 spots on top.
  roll,
  turn,
  turn,
  turn,
  roll,
  turn,
  turn,
  turn,
  roll,
  turn,
  turn,
  turn,
];

const translate = (position: Position, translation: Position): Position => ({
  x: position.x + translation.x,
  y: position.y + translation.y,
  z: position.z + translation.z,
});

const hasAtLeast12Matches = (
  scansA: Position[],
  scansB: Position[]
): boolean => {
  const setA = new Set<string>();
  for (const scanA of scansA) {
    setA.add(positionToString(scanA));
  }

  return (
    scansB.filter((scanB) => setA.has(positionToString(scanB))).length >= 12
  );
};

/**
 *
 * @returns
 * - The position of the scanner.
 * - The positions of the scans of the scanner.
 */
const placeScan = (
  scannerToPlaceId: number,
  placedScannerId: number
): [Position, Position[]] | null => {
  const scansOfPlacedScanner = placedScans.get(placedScannerId)!;
  let rotatedScansToPlace = scans[scannerToPlaceId];
  // We need to try all the 24 orientations of the scanner.
  for (const rotate of sequenceToVisitAllFacesOfADice) {
    rotatedScansToPlace = rotatedScansToPlace.map(rotate);
    // We try to match each point on another point.
    for (const scanToPlaceBase of rotatedScansToPlace) {
      for (const placedScanBase of scansOfPlacedScanner) {
        // We translated the points of the scanner to place to the position of `placedScanBase`.
        const translation = {
          x: placedScanBase.x - scanToPlaceBase.x,
          y: placedScanBase.y - scanToPlaceBase.y,
          z: placedScanBase.z - scanToPlaceBase.z,
        };
        const normalizedScansToPlace = rotatedScansToPlace.map((scan) =>
          translate(scan, translation)
        );
        // Verify there are 12 of them.
        const matches = hasAtLeast12Matches(
          scansOfPlacedScanner,
          normalizedScansToPlace
        );
        if (matches) {
          return [
            {
              x: -translation.x,
              y: -translation.y,
              z: -translation.z,
            },
            normalizedScansToPlace,
          ];
        }
      }
    }
  }
  return null;
};

while (scannersToPlace.length) {
  console.log("scannersToPlace.length", scannersToPlace.length);
  const scannerToPlaceId = scannersToPlace.shift()!;

  // Try all the already placed scanners in all the positions.

  const reversedScannerKeys = [...scanners.keys()].reverse(); // Towards the end, it is more likely to find a match among the lastly placed scans.
  for (const placedScannerId of reversedScannerKeys) {
    // Test the 24 orientations for the new scanner.
    const placed = placeScan(scannerToPlaceId, placedScannerId);

    if (placed) {
      // TODO: Put the
      scanners.set(scannerToPlaceId, placed[0]);
      placedScans.set(scannerToPlaceId, placed[1]);
      break;
    }
  }

  if (!scanners.has(scannerToPlaceId)) {
    // If we couldn't place the scanner, we put it back at the end of the queue.
    scannersToPlace.push(scannerToPlaceId);
  }
}

const allBeacons = new Set<string>();

for (const scans of placedScans.values()) {
  for (const scan of scans) {
    allBeacons.add(positionToString(scan));
  }
}

const manhattanDistance = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
};

let max = 0;
for (const scannerA of scanners.values()) {
  for (const scannerB of scanners.values()) {
    max = Math.max(max, manhattanDistance(scannerA, scannerB));
  }
}

console.log(max); // 10685
