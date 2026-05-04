import { readFileSync } from "fs";
import * as path from "path";

const example = 2;

const textInput = readFileSync(
  path.join(
    __dirname,
    `input${example ? `-example${example > 1 ? `-${example}` : ""}` : ""}.txt`
  ),
  "utf-8"
);

const [rulesText, messagesText] = textInput.split("\n\n");

enum RuleType {
  Char,
  List,
}

type RuleChar = {
  type: RuleType.Char;
  char: string;
};

type RuleList = {
  type: RuleType.List;
  subRules: number[][]; // The ids of the sub rules or -> and.
};

type Rule = RuleChar | RuleList;

const rules = new Map<number, Rule>(
  rulesText.split("\n").map((line) => {
    const [idText, ruleText] = line.split(": ");
    const id = parseInt(idText);
    let rule: Rule;
    if (ruleText.startsWith('"')) {
      rule = {
        type: RuleType.Char,
        char: ruleText[1],
      };
    } else {
      rule = {
        type: RuleType.List,
        subRules: ruleText
          .split(" | ")
          .map((line) => line.split(" ").map(Number)),
      };
    }

    return [id, rule];
  })
);

const regexps = new Map<number, RegExp>();

const buildRegExp = (id: number): void => {
  if (regexps.has(id)) return;
  const rule = rules.get(id)!;
  switch (rule.type) {
    case RuleType.Char:
      regexps.set(id, new RegExp(rule.char));
      break;
    case RuleType.List:
      const subRegExps = rule.subRules
        .map((subRule) => {
          subRule.forEach(buildRegExp);
          return subRule
            .map((subRuleId) => regexps.get(subRuleId)!.source)
            .join("");
        })
        .map((v) => `(${v})`);
      regexps.set(id, new RegExp(subRegExps.join("|")));
      break;
  }
};
// ...existing code...

buildRegExp(31);
buildRegExp(42);

const rule42Source = regexps.get(42)!.source;
const rule31Source = regexps.get(31)!.source;

// Function to find ALL possible match lengths for a rule
// (since rules can have alternatives that match different lengths)
const getAllMatchLengths = (source: string, str: string): number[] => {
  // Try progressively longer substrings
  const lengths = new Set<number>();
  const regex = new RegExp(`^(${source})`);

  for (let len = 1; len <= str.length; len++) {
    const substr = str.slice(0, len);
    const match = regex.exec(substr);
    if (match && match[0] === substr) {
      lengths.add(len);
    }
  }

  return Array.from(lengths);
};

const isValid = (message: string): boolean => {
  const tryMatch = (str: string, count42: number, count31: number): boolean => {
    if (str.length === 0) {
      return count42 >= 2 && count31 >= 1 && count42 > count31;
    }

    // Try matching rule 42 (only if we haven't started matching 31s)
    if (count31 === 0) {
      const match42Lengths = getAllMatchLengths(rule42Source, str);
      for (const len of match42Lengths) {
        if (tryMatch(str.slice(len), count42 + 1, count31)) {
          return true;
        }
      }

      // Also try transitioning to rule 31 (if we have at least 2 rule-42s)
      if (count42 >= 2) {
        const match31Lengths = getAllMatchLengths(rule31Source, str);
        for (const len of match31Lengths) {
          if (tryMatch(str.slice(len), count42, count31 + 1)) {
            return true;
          }
        }
      }
    } else {
      // Once we've started matching 31s, only match more 31s
      const match31Lengths = getAllMatchLengths(rule31Source, str);
      for (const len of match31Lengths) {
        if (tryMatch(str.slice(len), count42, count31 + 1)) {
          return true;
        }
      }
    }

    return false;
  };

  return tryMatch(message, 0, 0);
};

const matches = messagesText.split("\n").filter(isValid);

console.log("matches", matches);
const result = matches.length;

console.log(result);
