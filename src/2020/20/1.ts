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

  const pixels = grid.map((line) => line.split("")) as Pixel[][];
  return {
    id,
    pixels,
  };
});

const getAllEdges = (tile: Tile): string[] => {
  const top = tile.pixels[0];
  const bottom = tile.pixels[tile.pixels.length - 1];
  const left = tile.pixels.map((row) => row[0]);
  const right = tile.pixels.map((row) => row[row.length - 1]);

  const edges = [top, bottom, left, right, top];
  const reversedEdges = edges.map((edge) => edge.slice().reverse());

  return [...edges, ...reversedEdges].map((edge) => edge.join(""));
};

const matchCount = new Map<number, number>();

for (const tile of input) {
  for (const otherTile of input) {
    if (tile.id === otherTile.id) {
      continue;
    }
    const tileEdges = getAllEdges(tile);
    const otherTileEdges = getAllEdges(otherTile);

    for (const edge of tileEdges) {
      if (otherTileEdges.includes(edge)) {
        matchCount.set(tile.id, (matchCount.get(tile.id) ?? 0) + 1);
        break;
      }
    }
  }
}

const corners = Array.from(matchCount.entries()).filter(
  ([_, count]) => count === 2,
);

const result = corners.reduce((product, [id]) => product * id, 1);

console.log(result); // 16192267830719
