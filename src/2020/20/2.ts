import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

type Pixel = "." | "#";

type Tile = {
  id: number;
  pixels: Pixel[][];
};

const input: Tile[] = textInput.split("\n\n").map((block) => {
  const [idLine, ...grid] = block.split("\n");

  const id = Number(idLine.split(" ")[1].split(":")[0]);

  const pixels = grid
    .filter((line) => line.trim())
    .map((line) => line.split("")) as Pixel[][];
  return {
    id,
    pixels,
  };
});

const inputMap = new Map(input.map((tile) => [tile.id, tile]));

const getAllEdges = (tile: Tile): string[] => {
  const top = tile.pixels[0];
  const bottom = tile.pixels[tile.pixels.length - 1];
  const left = tile.pixels.map((row) => row[0]);
  const right = tile.pixels.map((row) => row[row.length - 1]);

  const edges = [top, bottom, left, right];
  const reversedEdges = edges.map((edge) => edge.slice().reverse());

  return [...edges, ...reversedEdges].map((edge) => edge.join(""));
};

const matchingBorders = new Map<number, number[]>();

for (const tile of input) {
  for (const otherTile of input) {
    if (tile.id === otherTile.id) {
      continue;
    }
    const tileEdges = getAllEdges(tile);
    const otherTileEdges = getAllEdges(otherTile);

    for (const edge of tileEdges) {
      if (otherTileEdges.includes(edge)) {
        const array = matchingBorders.get(tile.id) ?? [];
        array.push(otherTile.id);
        matchingBorders.set(tile.id, array);
        break;
      }
    }
  }
}

const corners = Array.from(matchingBorders.entries()).filter(
  ([_, neighbors]) => neighbors.length === 2,
);

type ImageID = {
  tileId: number;
  rotation: number;
  flipped: boolean;
};

const rotate = (pixels: Pixel[][]): Pixel[][] => {
  return Array.from({ length: pixels[0].length }, (_, i) =>
    pixels.map((row) => row[i]).reverse(),
  );
};

const findTopLeftCorner = (): ImageID => {
  const corner = corners[0];

  const tile = inputMap.get(corner[0])!;

  const neighbors = corner[1].map((neighborId) => inputMap.get(neighborId)!);

  const neighborEdges = neighbors.map(getAllEdges);

  const getRightAndBottomEdges = (pixels: Pixel[][]): [Pixel[], Pixel[]] => {
    const right = pixels.map((row) => row[row.length - 1]);
    const bottom = pixels[pixels.length - 1];
    return [right, bottom];
  };

  let pixels = tile.pixels;

  for (const rotation of [0, 1, 2, 3] as const) {
    const bottomAndRightEdges = getRightAndBottomEdges(pixels);

    const rightEdgeMatches = neighborEdges.some((edges) =>
      edges.includes(bottomAndRightEdges[0].join("")),
    );
    const bottomEdgeMatches = neighborEdges.some((edges) =>
      edges.includes(bottomAndRightEdges[1].join("")),
    );
    if (rightEdgeMatches && bottomEdgeMatches) {
      return {
        tileId: tile.id,
        rotation,
        flipped: false,
      };
    }
    // Rotate
    pixels = rotate(pixels);
  }
  throw new Error("No valid orientation found for top left corner");
};

const getRightEdge = (pixels: Pixel[][]): Pixel[] => {
  return pixels.map((row) => row[row.length - 1]);
};

const getLeftEdge = (pixels: Pixel[][]): Pixel[] => {
  return pixels.map((row) => row[0]);
};

const getBottomEdge = (pixels: Pixel[][]): Pixel[] => {
  return pixels[pixels.length - 1];
};

const getTopEdge = (pixels: Pixel[][]): Pixel[] => {
  return pixels[0];
};

const getPixels = (imageId: ImageID): Pixel[][] => {
  const tileData = inputMap.get(imageId.tileId)!;

  let pixels = structuredClone(tileData.pixels);

  if (imageId.flipped) {
    pixels = pixels.map((row) => row.slice().reverse());
  }

  for (let i = 0; i < imageId.rotation; i++) {
    pixels = rotate(pixels);
  }
  return pixels;
};

const getImageIds = (): ImageID[][] => {
  const imageIds: ImageID[][] = [[findTopLeftCorner()]];

  const visited = new Set<number>([imageIds[0][0].tileId]);

  // Fill line by line.

  while (true) {
    const lastTile =
      imageIds[imageIds.length - 1][imageIds[imageIds.length - 1].length - 1];

    const neighbors = matchingBorders
      .get(lastTile.tileId)!
      .filter((id) => !visited.has(id));

    if (neighbors.length === 0) {
      // We are done.
      break;
    }

    const pixels = getPixels(lastTile);

    const rightEdge = getRightEdge(pixels);

    let rightTileId: number | null = null;

    // Attempt to find the next tile in the row.
    for (const neighborId of neighbors) {
      const neighborTile = inputMap.get(neighborId)!;
      const neighborEdges = getAllEdges(neighborTile);

      if (neighborEdges.includes(rightEdge.join(""))) {
        rightTileId = neighborId;
        break;
      }
    }

    if (rightTileId !== null) {
      // Insert the tile to the right with the correct orientation.
      const rightTile = inputMap.get(rightTileId)!;

      flippedLoop: for (const flipped of [false, true] as const) {
        let pixels = flipped
          ? rightTile.pixels.map((row) => row.slice().reverse())
          : rightTile.pixels;
        for (const rotation of [0, 1, 2, 3] as const) {
          const leftEdge = getLeftEdge(pixels);

          if (leftEdge.join("") === rightEdge.join("")) {
            imageIds[imageIds.length - 1].push({
              tileId: rightTile.id,
              rotation,
              flipped,
            });
            visited.add(rightTile.id);
            break flippedLoop;
          }
          pixels = rotate(pixels);
        }
      }
    } else {
      const tileToMatch = imageIds[imageIds.length - 1][0];

      const pixels = getPixels(tileToMatch);

      // We need to move to the next line.
      const bottomEdge = getBottomEdge(pixels);

      const neighbors = matchingBorders
        .get(tileToMatch.tileId)!
        .filter((id) => !visited.has(id));

      let bottomTileId: number;
      // Find the tile that goes below.
      for (const neighborId of neighbors) {
        const neighborTile = inputMap.get(neighborId)!;
        const neighborEdges = getAllEdges(neighborTile);

        if (neighborEdges.includes(bottomEdge.join(""))) {
          bottomTileId = neighborId;
          break;
        }
      }

      // Insert the tile to the bottom with the correct orientation.
      const bottomTile = inputMap.get(bottomTileId!)!;

      flippedLoop: for (const flipped of [false, true] as const) {
        let pixels = flipped
          ? bottomTile.pixels.map((row) => row.slice().reverse())
          : bottomTile.pixels;
        for (const rotation of [0, 1, 2, 3] as const) {
          const topEdge = getTopEdge(pixels);

          if (topEdge.join("") === bottomEdge.join("")) {
            imageIds.push([
              {
                tileId: bottomTile.id,
                rotation,
                flipped,
              },
            ]);
            visited.add(bottomTile.id);
            break flippedLoop;
          }
          pixels = rotate(pixels);
        }
      }
    }
  }

  if (visited.size !== input.length) {
    const missing = input
      .map((tile) => tile.id)
      .filter((id) => !visited.has(id));
    throw new Error(
      `Not all tiles were used. Missing tiles: ${missing.join(", ")}`,
    );
  }

  return imageIds;
};

const imageIds = getImageIds();

const constructImage: (imageIds: ImageID[][]) => string[] = (imageIds) => {
  const blocks = imageIds.flatMap((row) => {
    const tiles = row.map((tile) => {
      const tileData = inputMap.get(tile.tileId)!;

      let pixels = structuredClone(tileData.pixels);

      if (tile.flipped) {
        pixels = pixels.map((row) => row.slice().reverse());
      }

      for (let i = 0; i < tile.rotation; i++) {
        pixels = rotate(pixels);
      }

      // Remove borders
      pixels = pixels.slice(1, -1).map((row) => row.slice(1, -1));
      return pixels.map((row) => row.join(""));
    });
    const lines = tiles.reduce(
      (acc, pixels) => {
        return acc.map((line, i) => line + pixels[i]);
      },
      Array.from({ length: tiles[0][0].length }, () => ""),
    );
    return lines;
  });
  return blocks;
};

const image = constructImage(imageIds);

console.log(image.join("\n"));

const waveCount = image.reduce((count, line) => {
  return count + (line.match(/#/g)?.length ?? 0);
}, 0);

type XY = {
  x: number;
  y: number;
};

const monster = `                  # 
#    ##    ##    ###
 #  #  #  #  #  #   `
  .split("\n")
  .map((line) => line.split(""));

const monsterCoords = monster.flatMap((line, y) =>
  line
    .map((char, x) => (char === "#" ? { x, y } : null))
    .filter((c): c is XY => c !== null),
);

const getMonsterCount = (image: string[]): number => {
  for (const flipped of [false, true] as const) {
    for (const rotation of [0, 1, 2, 3] as const) {
      let pixels = flipped
        ? image.map((row) => row.split("").reverse().join(""))
        : image;

      for (let i = 0; i < rotation; i++) {
        pixels = rotate(pixels.map((line) => line.split("") as Pixel[])).map(
          (row) => row.join(""),
        );
      }

      let count = 0;

      for (let y = 0; y <= pixels.length - monster.length; y++) {
        for (let x = 0; x <= pixels[0].length - monster[0].length; x++) {
          if (
            monsterCoords.every(
              (coord) => pixels[y + coord.y][x + coord.x] === "#",
            )
          ) {
            count++;
          }
        }
      }

      if (count > 0) {
        return count;
      }
    }
  }
  throw new Error("No monsters found");
};

const monsterCount = getMonsterCount(image);

const result = waveCount - monsterCount * monsterCoords.length;

// x < 1923
console.log(result); // 1909
