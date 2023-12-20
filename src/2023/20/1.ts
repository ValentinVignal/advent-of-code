import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

enum Pulse {
  High,
  Low,
}

const broadcasterName = "broadcaster";

const enableLogging = false;

const log = (...args: any[]) => {
  if (!enableLogging) return;
  console.log(...args);
};

const pulseCount = {
  [Pulse.High]: 0,
  [Pulse.Low]: 0,
};

const pulses: (() => void)[] = [];

abstract class Module {
  constructor(
    readonly name: string,
    readonly destinations: string[]
  ) {}

  pulse(value: Pulse, from: string): void {
    log(this.name, "receives", Pulse[value]);
    pulseCount[value]++;
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

for (let i = 0; i < 1000; i++) {
  modules.get(broadcasterName)!.pulse(Pulse.Low, "");
  handlePulses();
}

console.log(pulseCount);

const result = pulseCount[Pulse.High] * pulseCount[Pulse.Low];

console.log(result); // 861743850
