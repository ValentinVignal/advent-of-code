import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Passport = Record<string, string>;

const passports: Passport[] = textInput.split("\n\n").map((block) => {
  return block
    .replace(/\n/g, " ")
    .split(" ")
    .reduce((acc, field) => {
      const [key, value] = field.split(":");
      acc[key] = value;
      return acc;
    }, {} as Passport);
});

const requiredFields = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"];

const isValidPassport = (passport: Passport): boolean => {
  return requiredFields.every((field) => field in passport);
};

const validPassports = passports.filter(isValidPassport);

// x != 94
console.log(validPassports.length); // 230
