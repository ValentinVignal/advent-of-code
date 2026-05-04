import { readFileSync } from "fs";
import * as path from "path";

const example = 0;

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

buildRegExp(31);
buildRegExp(42);

regexps.set(8, new RegExp(`(${regexps.get(42)!.source})+`));

const rule11Alternatives = [];
for (let n = 1; n <= 5; n++) {
  const pattern42 = Array(n).fill(regexps.get(42)!.source).join("");
  const pattern31 = Array(n).fill(regexps.get(31)!.source).join("");
  rule11Alternatives.push(`(${pattern42}${pattern31})`);
}
regexps.set(11, new RegExp(rule11Alternatives.join("|")));

buildRegExp(0);
regexps.set(0, new RegExp(`^${regexps.get(0)!.source}$`));

const matches = messagesText
  .split("\n")
  .filter((message) => regexps.get(0)!.exec(message));

console.log("matches", matches);
const result = matches.length;

console.log(regexps.get(0)!);

// 328 < x < 427
console.log(result); //
