import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Valve = {
  name: string;
  flow: number;
  accesses: Valve['name'][];
}

const valves: Valve[] = textInput.split('\n').filter((l) => l).map(
  (line) => {
    const name = line.substring(6, 8);
    const flow = parseInt(line.substring(23).split(';')[0]);
    let accesses: string[];
    if (line.includes('; tunnels lead to valves ')) {
      accesses = line.split('; tunnels lead to valves ')[1].split(', ');
    } else {
      accesses = [line.split('; tunnel leads to valve ')[1]];

    }
    if (!accesses) {
      console.log('shit', line);
    }
    return {
      name,
      flow,
      accesses,
    };
  }
)

const valvesWithFlowCount = valves.filter((v) => v.flow > 0).length;

const valvesMap: Map<Valve['name'], Valve> = valves.reduce((map, valve) => {
  return map.set(valve.name, valve);
}, new Map());


/** Total time before the volcano erupts (in minutes). */
const totalTime = 30;

type StateCore = {
  valveName: Valve['name'];
  openedValves: Valve['name'][];
  time: number;
}

class Cache {
  // `string` is `State.openedValves.sort().join(',')`.
  private cache: Map<StateCore['time'], Map<StateCore['valveName'], Map<string, number>>> = new Map();

  has({ time, valveName, openedValves }: StateCore): boolean {
    return this.cache.get(time)?.get(valveName)?.has(openedValves.sort().join(',')) ?? false;
  }

  set({ time, valveName, openedValves }: StateCore, value: number): void {
    if (!this.cache.has(time)) {
      this.cache.set(time, new Map());
    }
    const timeCache = this.cache.get(time)!;
    if (!timeCache.has(valveName)) {
      timeCache.set(valveName, new Map());
    }
    const valveCache = timeCache.get(valveName)!;
    valveCache.set(openedValves.sort().join(','), value);
  }

  get({ time, valveName, openedValves }: StateCore): number | null {
    return this.cache.get(time)?.get(valveName)?.get(openedValves.sort().join(',')) ?? null;
  }
}

const cache = new Cache();

let i = 0;


const visit = (state: StateCore): number => {
  i++;
  if (!(i % 100000)) {
    console.log('i', i);
  }
  state = {
    ...JSON.parse(JSON.stringify(state)),
    time: state.time + 1
  };

  if (cache.has(state)) {
    return cache.get(state)!;
  }

  // Release the pressure;
  const flowInCurrentMinute = state.openedValves.reduce((sum, valveName) => {
    return sum + valvesMap.get(valveName)!.flow;
  }, 0);

  if (state.time === totalTime) {
    return flowInCurrentMinute;
  } else if (state.openedValves.length === valvesWithFlowCount) {
    return flowInCurrentMinute + visit(state);
  }

  const valve = valvesMap.get(state.valveName)!;
  // console.log('valve', state.valveName, valve);
  const scenarios = valve.accesses.map((access) => {
    return {
      ...state,
      valveName: access,
    }
  });
  if (valve.flow > 0 && !state.openedValves.includes(valve.name)) {
    // The valve is not opened yet.
    scenarios.push({
      ...state,
      openedValves: [...state.openedValves, valve.name],
    });
  }
  const result = flowInCurrentMinute + Math.max(...scenarios.map(visit));
  cache.set(state, result);
  return result;
}

const result = visit({
  valveName: 'AA',
  time: 0,
  openedValves: [],
});

console.log(result); // 2119


