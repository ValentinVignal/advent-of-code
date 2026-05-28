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

type AllergenIngredient = {
  allergen: string;
  ingredient: string;
};

const ingredientToAllergen = new Map<string, string[]>();

for (const [allergen, ingredients] of allergenToIngredient.entries()) {
  for (const ingredient of ingredients) {
    if (!ingredientToAllergen.has(ingredient)) {
      ingredientToAllergen.set(ingredient, [allergen]);
    } else {
      ingredientToAllergen.get(ingredient)!.push(allergen);
    }
  }
}

const dangerousIngredients: AllergenIngredient[] = [];

const map = structuredClone(ingredientToAllergen);

while (map.size) {
  let allergen: string | null = null;
  let removeIngredient: string | null = null;
  for (const [ingredient, allergens] of map.entries()) {
    if (allergens.length === 1) {
      [allergen] = allergens;
      removeIngredient = ingredient;
      dangerousIngredients.push({
        ingredient,
        allergen,
      });

      break;
    }
  }
  map.delete(removeIngredient!);
  for (const [ingredient, allergens] of map.entries()) {
    map.set(
      ingredient,
      allergens.filter((a) => a !== allergen),
    );
  }
}

dangerousIngredients.sort((a, b) => a.allergen.localeCompare(b.allergen));

const result = dangerousIngredients.map((value) => value.ingredient).join(",");

// x != vhkj,vhkj,qzlmr,vhkj,lcb,lrqqqsg,vhkj,vhkj
console.log(result); // smfz,vhkj,qzlmr,tvdvzd,lcb,lrqqqsg,dfzqlk,shp
