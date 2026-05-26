import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

type Food = {
  ingredients: string[];
  allergens: string[];
};

const foods: Food[] = textInput.split("\n").map((line) => {
  const [ingredientsText, allergensText] = line.split(" (contains ");

  const ingredients = ingredientsText.split(" ");

  const allergens = allergensText.split(")")[0].split(", ");
  return {
    ingredients,
    allergens,
  };
});

const allergenToIngredient = new Map<string, string[]>();

const listIntersection = <T>(a: T[], b: T[]): T[] => {
  return a.filter((value) => b.indexOf(value) !== -1);
};

for (const food of foods) {
  for (const allergen of food.allergens) {
    if (allergenToIngredient.has(allergen)) {
      const existing = allergenToIngredient.get(allergen)!;

      allergenToIngredient.set(
        allergen,
        listIntersection(existing, food.ingredients),
      );
    } else {
      allergenToIngredient.set(allergen, food.ingredients);
    }
  }
}

const allIngredientsWithAllergen = new Set<string>();

for (const ingredients of allergenToIngredient.values()) {
  for (const ingredient of ingredients) {
    allIngredientsWithAllergen.add(ingredient);
  }
}

let result = 0;

for (const food of foods) {
  for (const ingredient of food.ingredients) {
    if (!allIngredientsWithAllergen.has(ingredient)) {
      result++;
    }
  }
}

// x < 2582
console.log(result); // 2302
