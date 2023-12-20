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
  static readonly toRegister = [`dh`, `vf`, `mk`, `rn`];
  readonly history: Pulse[] = [];
  constructor(
    readonly name: string,
    public destinations: string[]
  ) {}

  pulse(value: Pulse, from: string): void {
    if (Module.toRegister.includes(this.name)) {
      this.history.push(value);
    }
    if (this.name === "rx" && value === Pulse.Low) {
      console.log(this.name, value, buttonPushes);
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

for (let i = 0; i < initialPushes; i++) {
  modules.get(broadcasterName)?.pulse(Pulse.Low, "");
  handlePulses();
}

const histories = new Map<string, Pulse[]>(
  Module.toRegister.map((name) => [name, modules.get(name)!.history] as const)
);
const findPeriod = (history: Pulse[]): number => {
  let period = 1;
  while (true) {
    period++;
    let found = true;
    for (let i = 0; i < period; i++) {
      const values: Pulse[] = [];
      for (let p = 0; p < Math.floor(initialPushes / period); p++) {
        values.push(history[i + p * period]);
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
 * { 'dh': 4190, 'vf': 6764, 'mk': 7160, 'rn': 6224 }
 * ```
 *
 * lcm of all periods: `3946846623920`
 */
const periodLength = new Map<string, number>(
  Module.toRegister.map((name) => [name, findPeriod(histories.get(name)!)])
);

console.log("periodLength", periodLength);

/**
 * ```ts
 * { 'dh': 4183, 'vf': 6757, 'mk': 7149, 'rn': 6216 }
 * ```
 */
const firstLowPulse = new Map<string, number>(
  Module.toRegister.map(
    (name) => [name, histories.get(name)!.indexOf(Pulse.Low) + 1] as const
  )
);
console.log("firstLowPulse", firstLowPulse);

/**
 * The period length ordered in descending order.
 */
const orderedPeriodLength = [...periodLength.entries()].sort((a, b) => {
  return b[1] - a[1];
});

/**
 * The current value of each register. The value is the offset inside the
 * period. We want all of them to be `0`.
 */
const value = new Map<string, number>(
  Module.toRegister.map((name) => {
    const history = histories.get(name)!;
    return [name, history.length - 1 - history.lastIndexOf(Pulse.Low)] as const;
  })
);

/**
 * `mk`
 */
const signalWithLongestPeriod = orderedPeriodLength[0][0];
const correctedSignals = new Set([signalWithLongestPeriod]);

let pushes = histories.get(signalWithLongestPeriod)!.lastIndexOf(Pulse.Low) + 1;

const isOnLow = (name: string) => {
  return !((pushes - firstLowPulse.get(name)!) % periodLength.get(name)!);
};
const isAllOnLow = () => {
  return Module.toRegister.every(isOnLow);
};

const getGcd = (a: number, b: number): number => {
  return b === 0 ? a : getGcd(b, a % b);
};

const getLcm = (arr: number[]): number => {
  return arr.reduce((acc, n) => (acc * n) / getGcd(acc, n));
};

let i = 0;
let numberOfModulesOnLow = 1;
let lcm = periodLength.get(signalWithLongestPeriod)!;
while (!isAllOnLow()) {
  i++;
  const modulesOnLow = Module.toRegister.filter(isOnLow);
  if (modulesOnLow.length > numberOfModulesOnLow) {
    numberOfModulesOnLow = modulesOnLow.length;
    lcm = getLcm(modulesOnLow.map((name) => periodLength.get(name)!));
  }

  pushes += lcm;

  if (!(i % 500000)) {
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
        .filter((n) => !isOnLow(n))
        .map((name) => {
          return [
            name,
            (pushes - firstLowPulse.get(name)!) % periodLength.get(name)!,
          ] as const;
        })
    );
  }
}

// 3946846623920
console.log("lcm", lcm);

let result = lcm;

// 3946846623920 < x
console.log(result);
