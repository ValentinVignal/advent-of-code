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

const isValidBirthYear = (byr: string): boolean => {
  if (!/^\d{4}$/.test(byr)) return false;
  const year = parseInt(byr, 10);
  return year >= 1920 && year <= 2002;
};

const isValidIssueYear = (iyr: string): boolean => {
  if (!/^\d{4}$/.test(iyr)) return false;
  const year = parseInt(iyr, 10);
  return year >= 2010 && year <= 2020;
};

const isValidExpirationYear = (eyr: string): boolean => {
  if (!/^\d{4}$/.test(eyr)) return false;
  const year = parseInt(eyr, 10);
  return year >= 2020 && year <= 2030;
};

const isValidHeight = (hgt: string): boolean => {
  const match = hgt.match(/^(\d+)(cm|in)$/);
  if (!match) return false;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "cm") {
    return value >= 150 && value <= 193;
  } else {
    return value >= 59 && value <= 76;
  }
};

const isValidHairColor = (hcl: string): boolean => {
  return /^#[0-9a-f]{6}$/.test(hcl);
};

const isValidEyeColor = (ecl: string): boolean =>
  ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].includes(ecl);

const isValidPassportId = (pid: string): boolean => /^\d{9}$/.test(pid);

const isValidPassport = (passport: Passport): boolean => {
  const hasAllFields = requiredFields.every((field) => field in passport);
  if (!hasAllFields) return false;
  return (
    isValidBirthYear(passport["byr"]) &&
    isValidIssueYear(passport["iyr"]) &&
    isValidExpirationYear(passport["eyr"]) &&
    isValidHeight(passport["hgt"]) &&
    isValidHairColor(passport["hcl"]) &&
    isValidEyeColor(passport["ecl"]) &&
    isValidPassportId(passport["pid"])
  );
};

const validPassports = passports.filter(isValidPassport);

console.log(validPassports.length); // 156
