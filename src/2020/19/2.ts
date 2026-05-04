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

const messages = messagesText.split("\n");

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

rules.set(8, {
  type: RuleType.List,
  subRules: [[42], [42, 8]],
});
rules.set(11, {
  type: RuleType.List,
  subRules: [
    [42, 31],
    [42, 11, 31],
  ],
});

const matchRules = (message: string): boolean => {
  type Match = {
    matches: boolean;
    remaining: string[];
  };

  const matchRule8 = (message: string): Match => {
    let remaining = [message];
    const allRemaining = [];
    while (remaining.length) {
      const result = remaining
        .map((str) => matchRule(str, 42))
        .filter((result) => result.matches);
      if (!result.length) {
        break;
      }
      remaining = result.flatMap((r) => r.remaining);
      allRemaining.push(...remaining);
    }
    return {
      matches: allRemaining.length > 0,
      remaining: allRemaining,
    };
  };

  const matchRule11 = (message: string): Match => {
    let remaining = [message];
    const allRemaining = [];
    while (remaining.length) {
      const result = remaining
        .map((str) => {
          const res42 = matchRule(str, 42);
          if (!res42.matches) {
            return {
              matches: false,
              remaining: [],
            };
          }
          const res31 = res42.remaining
            .map((s) => matchRule(s, 31))
            .filter((r) => r.matches);
          if (!res31.length) {
            return {
              matches: false,
              remaining: [],
            };
          }
          return {
            matches: true,
            remaining: res31.flatMap((r) => r.remaining),
          };
        })
        .filter((r) => r.matches);
      if (!result.length) {
        break;
      }
      remaining = result.flatMap((r) => r.remaining);
      allRemaining.push(...remaining);
    }
    return {
      matches: allRemaining.length > 0,
      remaining: allRemaining,
    };
  };

  const matchRule = (message: string, id: number): Match => {
    if (id === 8) {
      return matchRule8(message);
    } else if (id === 11) {
      return matchRule11(message);
    }
    const rule = rules.get(id)!;

    switch (rule.type) {
      case RuleType.Char:
        if (message.startsWith(rule.char)) {
          return {
            matches: true,
            remaining: [message.substring(1)],
          };
        } else {
          return {
            matches: false,
            remaining: [],
          };
        }
      case RuleType.List:
        const results = rule.subRules
          .map((subRules) => {
            let remaining = [message];
            for (const subRule of subRules) {
              const result = remaining
                .map((str) => {
                  return matchRule(str, subRule);
                })
                .filter((result) => result.matches);
              if (!result.length) {
                return {
                  matches: false,
                  remaining: [],
                };
              }
              remaining = result.flatMap((r) => r.remaining);
            }
            return {
              matches: true,
              remaining: remaining,
            };
          })
          .filter((result) => result.matches);
        if (!results.length) {
          return {
            matches: false,
            remaining: [],
          };
        }
        return {
          matches: true,
          remaining: results.flatMap((result) => result.remaining),
        };
    }
  };

  const result = matchRule(message, 0);
  return result.matches && result.remaining.includes("");
};

const results = messages.map((message) => matchRules(message));
const result = results.filter((r) => r).length;

console.log(result); // 111
