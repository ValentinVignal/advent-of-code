import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type RGB = {
  red: number;
  green: number;
  blue: number;
};

type Color = keyof RGB;

const games = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const pulls = line
      .split(": ")[1]
      .split("; ")
      .map((pull) => {
        const rgb: RGB = {
          red: 0,
          green: 0,
          blue: 0,
        };
        for (const colorString of pull.split(", ")) {
          const [valueString, color] = colorString.split(" ");
          rgb[color as Color] = parseInt(valueString);
        }
        return rgb;
      });
    return pulls.reduce(
      (acc, pull) => {
        return {
          red: Math.max(acc.red, pull.red),
          green: Math.max(acc.green, pull.green),
          blue: Math.max(acc.blue, pull.blue),
        };
      },
      { red: 0, green: 0, blue: 0 }
    );
  });
const possibles = games.map((game) => {
  return game.red <= 12 && game.green <= 13 && game.blue <= 14;
});

const sum = possibles.reduce((acc, possible, index) => {
  return acc + (possible ? index + 1 : 0);
}, 0);

// x < 5050
console.log(sum); // 2727
