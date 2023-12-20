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
  static readonly pulsesPerPress = new Map<number, number>();
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
      for (const name of Module.toRegister) {
        Module.histories.get(name)!.push(this.received.get(name)!);
      }
      Module.pulsesPerPress.set(
        buttonPushes,
        (Module.pulsesPerPress.get(buttonPushes) ?? 0) + 1
      );
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
const initialPushes = 1e4;

const pressButton = () => {
  buttonPushes++;
  modules.get(broadcasterName)?.pulse(Pulse.Low, "");
  handlePulses();
};

for (let i = 0; i < initialPushes; i++) {
  pressButton();
}

/**
 * `61402`
 */
const historyLengths = new Map<string, number>(
  Module.toRegister.map((name) => [name, Module.histories.get(name)!.length])
);

console.log("historyLengths", historyLengths);
const findPeriod = (history: Pulse[]): number => {
  const historyWithoutStart = history.slice(1e3);
  const length = historyWithoutStart.length;
  let period = 1;
  while (true) {
    period++;
    let found = true;
    for (let i = 0; i < period; i++) {
      const values: Pulse[] = [];
      for (let p = 0; p < Math.floor(length / period); p++) {
        values.push(historyWithoutStart[i + p * period]);
      }
      if (!values.every((v) => v === values[0])) {
        found = false;
        break;
      }
    }
    if (found) {
      return period;
    }
  }
};

/**
 * ```ts
 * { 'dh': 24573, 'vf': 23628, 'mk': 25126, 'rn': 24097 }
 * ```
 *
 * lcm of all periods: `58,589,558,519,115,228`
 */
const periodLength = new Map<string, number>(
  Module.toRegister.map((name) => [
    name,
    findPeriod(Module.histories.get(name)!),
  ])
);

console.log("periodLength", periodLength);

const getGcd = (a: number, b: number): number => {
  return b === 0 ? a : getGcd(b, a % b);
};

const getLcm = (arr: number[]): number => {
  return arr.reduce((acc, n) => (acc * n) / getGcd(acc, n));
};

/**
 * ```ts
 * { 'dh': 24554, 'vf': 23602, 'mk': 25105, 'rn': 24067 }
 * ```
 */
const firstHighPulse = new Map<string, number>(
  Module.toRegister.map(
    (name) =>
      [name, Module.histories.get(name)!.indexOf(Pulse.High) + 1] as const
  )
);
console.log("firstHighPulse", firstHighPulse);

/**
 * ```ts
 * { 'dh': 49130, 'vf': 47230, 'mk': 50235, 'rn': 48168 }
 * ```
 */
const lastHighPulse = new Map<string, number>(
  Module.toRegister.map(
    (name) =>
      [name, Module.histories.get(name)!.lastIndexOf(Pulse.High) + 1] as const
  )
);
console.log("lastHighPulse", lastHighPulse);

/**
 * ```ts
 *  { 'dh': 4, 'vf': 1, 'mk': 5, 'rn': 5 }
 * ```
 */
const numberOfHighsInPeriod = new Map<string, number>(
  Module.toRegister.map((name) => {
    const highIndex = lastHighPulse.get(name)!;
    return [
      name,
      Module.histories
        .get(name)!
        .slice(highIndex - periodLength.get(name)!, highIndex)
        .filter((p) => p === Pulse.High).length,
    ];
  })
);

console.log("numberOfHighsInPeriod", numberOfHighsInPeriod);

const periods = new Map<string, Pulse[]>(
  Module.toRegister.map((name) => {
    const highIndex = lastHighPulse.get(name)!;
    return [
      name,
      Module.histories
        .get(name)!
        .slice(highIndex - periodLength.get(name)!, highIndex),
    ];
  })
);

/**
 * The period length ordered in descending order.
 */
const orderedPeriodLength = [...periodLength.entries()].sort((a, b) => {
  return b[1] - a[1];
});

// The only signal with 1 high.
const baseSignal = "vf";

let pushes = lastHighPulse.get(baseSignal)!;

const isOnHigh = (name: string) => {
  const period = periodLength.get(name)!;
  const index = pushes - lastHighPulse.get(name)! - 1 + period;
  return periods.get(name)![index % period] === Pulse.High;
};
const isAllOnHigh = () => {
  return Module.toRegister.every(isOnHigh);
};

let i = 0;
let numberOfModulesOnLow = 1;
let lcm = periodLength.get(baseSignal)!;
while (!isAllOnHigh()) {
  i++;
  if (pushes > Number.MAX_SAFE_INTEGER) {
    throw Error(`Too big ${pushes} (${i})`);
  }
  const modulesOnLow = Module.toRegister.filter(isOnHigh);

  pushes += lcm;

  if (!(i % 10000000)) {
    console.log(
      "i",
      i,
      "pushes",
      pushes,
      "lcm",
      lcm,
      "numberOfModulesOnLow",
      numberOfModulesOnLow,
      "modulesOnLow",
      modulesOnLow,
      "bad modules",
      Module.toRegister
        .filter((n) => !isOnHigh(n))
        .map((name) => {
          return [
            name,
            (pushes - firstHighPulse.get(name)!) % periodLength.get(name)!,
          ] as const;
        })
    );
  }
}

// 3946846623920
console.log("lcm", lcm);

let result = lcm;

// 3946846623920 < x < 58,589,558,519,115,228
console.log(result);
