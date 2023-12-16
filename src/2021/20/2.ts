import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const [algorithmText, imageText] = textInput.split("\n\n");

type Pixel = "#" | ".";

type Image = Pixel[][];

const algorithm = algorithmText.split("").filter(Boolean) as Pixel[];

let image: Image = imageText
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Pixel[]);

const addPadding = (image: Image, index: number): Image => {
  // The first character of the algorithm (0) is a `#` while the last (511) is a
  // `.`. It means that at the first and all the odd iterations, the empty space
  // around the image (`.`) is all filled (`#`). At the even iterations, the all filled space around the image (`#`) is all empty (`.`).
  const characterToFill = algorithm[0] === "." || !(index % 2) ? "." : "#";
  const filler = () =>
    Array.from({ length: image[0].length + 4 }, () => characterToFill);
  return [
    filler(),
    filler(),
    ...image.map((line) => [
      characterToFill,
      characterToFill,
      ...line,
      characterToFill,
      characterToFill,
    ]),
    filler(),
    filler(),
  ] as Image;
};

const removePadding = (image: Image): Image => {
  const newImage = structuredClone(image);
  newImage.shift();
  newImage.pop();
  newImage.forEach((line) => {
    line.shift();
    line.pop();
  });
  return newImage;
};

const enhanceImage = (image: Image): Image => {
  const newImage = structuredClone(image);
  for (let y = 1; y < image.length - 1; y++) {
    for (let x = 1; x < image[y].length - 1; x++) {
      const pixels: Pixel[] = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          pixels.push(image[y + dy][x + dx]);
        }
      }
      const value = parseInt(
        pixels.map((pixel) => (pixel === "." ? "0" : "1")).join(""),
        2
      );

      newImage[y][x] = algorithm[value];
    }
  }
  return newImage;
};

const printImage = () => {
  console.log([...image.map((line) => line.join("")), ""].join("\n"));
};

printImage();

for (let i = 0; i < 50; i++) {
  image = addPadding(image, i);
  image = enhanceImage(image);
  image = removePadding(image);
  printImage();
}

const result = image
  .map((line) => line.filter((pixel) => pixel === "#").length)
  .reduce((a, b) => a + b, 0);

console.log(result); // 18723
