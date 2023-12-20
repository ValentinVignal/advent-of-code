import { readFileSync } from "fs";
import * as path from "path";

// https://fr.wikipedia.org/wiki/Congruence_lin%C3%A9aire

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

enum Pulse {
  High = "h",
  Low = "l",
}

const broadcasterName = "broadcaster";

const pulses: (() => void)[] = [];

let buttonPushes = 0;

abstract class Module {
  static readonly rx = "rx";
  /**
   * The conjunction just before rx.
   */
  static readonly jz = "jz";
  static readonly toRegister = [`dh`, `vf`, `mk`, `rn`];
  static readonly histories = new Map<string, Pulse[]>(
    Module.toRegister.map((name) => [name, []])
  );
  constructor(
    readonly name: string,
    public destinations: string[]
  ) {}

  pulse(value: Pulse, from: string): void {
    if (this.name === Module.rx) {
      if (value === Pulse.Low) {
        console.log(this.name, value, buttonPushes);
      }
    }
  }

  protected sendToDestinations(value: Pulse): void {
    for (const destination of this.destinations) {
      pulses.push(() => modules.get(destination)?.pulse(value, this.name));
    }
  }
}

class FlipFlop extends Module {
  private state: boolean = false;
  constructor(
    readonly name: string,
    readonly destinations: string[]
  ) {
    super(name, destinations);
  }

  pulse(value: Pulse, from: string): void {
    super.pulse(value, from);
    if (value === Pulse.High) return;
    if (this.state) {
      this.sendToDestinations(Pulse.Low);
    } else {
      this.sendToDestinations(Pulse.High);
    }
    this.state = !this.state;
  }
}

class Conjunction extends Module {
  private received = new Map<String, Pulse>();

  constructor(
    readonly name: string,
    readonly destinations: string[]
  ) {
    super(name, destinations);
  }

  pulse(value: Pulse, from: string): void {
    super.pulse(value, from);
    this.received.set(from, value);
    if (this.name === Module.jz) {
      const history = Module.histories.get(from)!;
      if (history.length < buttonPushes) {
        history.push(value);
      } else if (
        history[history.length - 1] === Pulse.Low &&
        value === Pulse.High
      ) {
        history[history.length - 1] = value;
      }
    }
    if ([...this.received.values()].every((v) => v === Pulse.High)) {
      this.sendToDestinations(Pulse.Low);
    } else {
      this.sendToDestinations(Pulse.High);
    }
  }

  register(from: string): void {
    this.received.set(from, Pulse.Low);
  }
}

class Broadcast extends Module {
  constructor(
    readonly name: string,
    readonly destinations: string[]
  ) {
    super(name, destinations);
  }

  pulse(value: Pulse, from: string): void {
    super.pulse(value, from);
    this.sendToDestinations(value);
  }
}

class UntypedModule extends Module {
  constructor(readonly name: string) {
    super(name, []);
  }
}

const modules = new Map<string, Module>();

textInput
  .split("\n")
  .filter(Boolean)
  .forEach((line) => {
    const [typeString, destinationsString] = line.split(" -> ");
    const destinations = destinationsString.split(", ");
    let name = typeString.slice(1);
    switch (typeString[0]) {
      case "%":
        modules.set(name, new FlipFlop(name, destinations));
        break;
      case "&":
        modules.set(name, new Conjunction(name, destinations));
        break;
      default:
        name = typeString;
        // No specific type.
        if (typeString === broadcasterName) {
          modules.set(name, new Broadcast(name, destinations));
        } else {
          modules.set(name, new UntypedModule(name));
        }
        break;
    }
  });

for (const module of modules.values()) {
  if (module instanceof Conjunction) {
    for (const otherModule of modules.values()) {
      if (otherModule.destinations.includes(module.name)) {
        module.register(otherModule.name);
      }
    }
  }
  for (const destination of module.destinations) {
    if (modules.has(destination)) continue;
    modules.set(destination, new UntypedModule(destination));
  }
}

const handlePulses = () => {
  while (pulses.length) {
    pulses.shift()!();
  }
};

// This is the design before `rx`:
// rx <- &jz <- &dh, &vf, &mk, &rn

// Having a low pulse on `rx`, means having a high pulses on `jz`, which means
// that `dh`, `vf`, `mk`, `rn` must send a high pulse. So they all need to
// receive a low pulse.

// Push the button a lot of time to find patterns.
const initialPushes = 1e5;

const pressButton = () => {
  buttonPushes++;
  modules.get(broadcasterName)?.pulse(Pulse.Low, "");
  handlePulses();
};

for (let i = 0; i < initialPushes; i++) {
  pressButton();
}

/**
 * `100000`
 */
const historyLengths = new Map<string, number>(
  Module.toRegister.map((name) => [name, Module.histories.get(name)!.length])
);

console.log("historyLengths", historyLengths);
const findPeriod = (history: Pulse[]): number => {
  const periodCount = 3;
  let period = 1;
  while (true) {
    period++;
    if (period > history.length / periodCount) {
      throw Error("No periodicity found");
    }
    let found = true;
    for (let i = 0; i < period; i++) {
      const values: Pulse[] = [];
      for (let p = 0; p < periodCount; p++) {
        values.push(history[history.length - 1 - (i + p * period)]);
      }
      if (!values.every((v) => v === values[0])) {
        found = false;
        break;
      }
    }
    if (found) {
      // Verify it is not only lows.
      const values = history.slice(history.length - period, history.length);
      if (values.includes(Pulse.High)) {
        return period;
      }
    }
  }
};

/**
 * ```ts
 * { 'dh': 4001, 'vf': 3847, 'mk': 4091, 'rn': 3923 }
 * ```
 */
const periodLengths = new Map<string, number>(
  Module.toRegister.map((name) => [
    name,
    findPeriod(Module.histories.get(name)!),
  ])
);

console.log("periodLength", periodLengths);

const getGcd = (a: number, b: number): number => {
  return b === 0 ? a : getGcd(b, a % b);
};

const getLcm = (arr: number[]): number => {
  return arr.reduce((acc, n) => (acc * n) / getGcd(acc, n));
};

/**
 * ```ts
 * { 'dh': 96023, 'vf': 96174, 'mk': 98183, 'rn': 98074 }
 * ```
 */
const lastHighPulses = new Map<string, number>(
  Module.toRegister.map(
    (name) =>
      [name, Module.histories.get(name)!.lastIndexOf(Pulse.High)] as const
  )
);
console.log("lastHighPulse", lastHighPulses);

/**
 * ```ts
 *  { 'dh': 1, 'vf': 1, 'mk': 1, 'rn': 1 }
 * ```
 */
const numberOfHighsInPeriod = new Map<string, number>(
  Module.toRegister.map((name) => {
    const highIndex = lastHighPulses.get(name)!;
    return [
      name,
      Module.histories
        .get(name)!
        .slice(highIndex - periodLengths.get(name)!, highIndex)
        .filter((p) => p === Pulse.High).length,
    ];
  })
);

console.log("numberOfHighsInPeriod", numberOfHighsInPeriod);

/**
 * The period of each signal. Starts with a high pulse.
 */
const periods = new Map<string, Pulse[]>(
  Module.toRegister.map((name) => {
    const highIndex = lastHighPulses.get(name)!;
    return [
      name,
      Module.histories
        .get(name)!
        .slice(highIndex - periodLengths.get(name)!, highIndex),
    ];
  })
);

/**
 * The period length ordered in descending order.
 *
 * ```ts
 * [ 'mk', 4091 ]
 * ```
 */
const orderedPeriodLengths = [...periodLengths.entries()].sort((a, b) => {
  return b[1] - a[1];
});

const moduleWithLongestPeriod = orderedPeriodLengths[0];

console.log("moduleWithLongestPeriod", moduleWithLongestPeriod);

let pushes = periodLengths.get(moduleWithLongestPeriod[0])!;

const isOnHigh = (name: string) => {
  const periodLength = periodLengths.get(name)!;

  const lastHighPulse = lastHighPulses.get(name)!;

  const index = pushes - lastHighPulse - 1;
  const moduloIndex = index % periodLength;
  return periods.get(name)![moduloIndex] === Pulse.High;
};
const isAllOnHigh = () => {
  return Module.toRegister.every(isOnHigh);
};

let i = 0;
let numberOfModulesOnHigh = 1;
let delta = moduleWithLongestPeriod[1];
while (!isAllOnHigh()) {
  i++;
  if (pushes > Number.MAX_SAFE_INTEGER) {
    throw Error(`Too big ${pushes} (${i})`);
  }
  const modulesOnHigh = Module.toRegister.filter(isOnHigh);
  if (numberOfModulesOnHigh < modulesOnHigh.length) {
    numberOfModulesOnHigh = moduleWithLongestPeriod.length;
    delta = getLcm(modulesOnHigh.map((name) => periodLengths.get(name)!));
  }

  pushes += delta;

  if (!(i % 100)) {
    console.log(
      "i",
      i,
      "pushes",
      pushes,
      "delta",
      delta,
      "numberOfModulesOnHigh",
      numberOfModulesOnHigh,
      "modulesOnHigh",
      modulesOnHigh,
      "bad modules",
      Module.toRegister
        .filter((n) => !isOnHigh(n))
        .map((name) => {
          return [
            name,
            (pushes - lastHighPulses.get(name)!) % periodLengths.get(name)!,
          ] as const;
        })
    );
  }
}

// 61740476071
console.log("delta", delta);

// 247023644760071
console.log("pushes", pushes);

let result = pushes;

// 3946846623920 < 113712121979764 < 113712121979765 < x < 58,589,558,519,115,228
console.log(result); // 247023644760071
