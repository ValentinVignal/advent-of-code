import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8').trim();


type BluePrint = {
  ore: { ore: number };
  clay: { ore: number };
  obsidian: {
    ore: number;
    clay: number;
  };
  geode: {
    ore: number;
    obsidian: number;
  };
}

const bluePrints: BluePrint[] = textInput.split('\n').filter(Boolean).slice(0, 3).map((line) => {
  const orePrice = parseInt(line.split('Each ore robot costs')[1].split('ore.')[0].trim());
  const clayPrice = parseInt(line.split('Each clay robot costs')[1].split('ore.')[0].trim());
  const obsidianPrices = line.split('Each obsidian robot costs')[1].split('clay.')[0].trim();
  const obsidianOrePrice = parseInt(obsidianPrices.split('ore')[0].trim());
  const obsidianClayPrice = parseInt(obsidianPrices.split('and')[1].trim());
  const geodeOrePrices = line.split('Each geode robot costs')[1].split('obsidian.')[0].trim();
  const geodeOrePrice = parseInt(geodeOrePrices.split('ore')[0].trim());
  const geodeObsidianPrice = parseInt(geodeOrePrices.split('and')[1].trim());
  return {
    ore: { ore: orePrice },
    clay: { ore: clayPrice },
    obsidian: {
      ore: obsidianOrePrice,
      clay: obsidianClayPrice,
    },
    geode: {
      ore: geodeOrePrice,
      obsidian: geodeObsidianPrice,
    }
  }
});

console.log(bluePrints);

type Stones = {
  ore: number;
  clay: number;
  obsidian: number;
}

type Resources = Stones;
type Robots = Stones & { geode: number };
type State = {
  resources: Resources;
  robots: Robots;
  minute: number;
}


const results = bluePrints.map((bluePrint, index) => {
  let maxGeodes = 0;
  const cache = new Map<string, number>();
  const maxOre = Math.max(bluePrint.ore.ore, bluePrint.clay.ore, bluePrint.obsidian.ore, bluePrint.geode.ore);
  const canBuildOre = (state: State): boolean => {
    return state.resources.ore >= bluePrint.ore.ore && state.robots.ore < maxOre;
  }
  const maxClay = bluePrint.obsidian.clay
  const canBuildClay = (state: State): boolean => {
    return state.resources.ore >= bluePrint.clay.ore && state.robots.clay < maxClay;
  }

  const maxObsidian = bluePrint.geode.obsidian;
  const canBuildObsidian = (state: State): boolean => {
    return state.resources.ore >= bluePrint.obsidian.ore && state.resources.clay >= bluePrint.obsidian.clay && state.robots.obsidian < maxObsidian;
  }
  const canBuildGeode = (state: State): boolean => {
    return state.resources.ore >= bluePrint.geode.ore && state.resources.obsidian >= bluePrint.geode.obsidian;
  }



  const run = (state: State, geodes: number): number => {
    if (state.minute === 0) {
      return geodes;
    }
    // Check if we are on a bad path and abort it if it cannot out-max the max.
    /*
      1: 1 
      2: 1 + 2 = 3
      3 :1 + 2+ 3 = 6
      4: 1 + 2 + 3 + 4 = 10
  
      n => n * (n+1) / 2
      1 : 1
      2: 3
      3: 6
  
      a, b
  
      (a + b)(a + b + 1) / 2
      - 
      a ( a + 1 ) /2
  
      But a robot is only created after the minute, so b = b - 1
     */
    const a = state.robots.geode;
    const b = state.minute;
    const maxNewGeodes = (((a + b) * (a + b - 1)) - (a * (a - 1))) / 2;
    if (geodes + maxNewGeodes < maxGeodes) {
      // Even if it was building a geode robot at every turn until the end, it
      // wouldn't be better than the max currently found.
      return 0;
    }

    const stringifiedState = JSON.stringify(state);

    if (cache.has(stringifiedState)) {
      return cache.get(stringifiedState)!;
    }
    const minuteState: State = JSON.parse(stringifiedState);
    minuteState.minute--;

    const _canBuildOre = canBuildOre(state);
    const _canBuildClay = canBuildClay(state);
    const _canBuildObsidian = canBuildObsidian(state);
    const _canBuildGeode = canBuildGeode(state);

    const onlyGeodes = minuteState.robots.ore > bluePrint.geode.ore && minuteState.robots.obsidian > bluePrint.geode.obsidian;
    const scenarios = [];
    // Collect
    minuteState.resources.ore += minuteState.robots.ore;
    minuteState.resources.clay += minuteState.robots.clay;
    minuteState.resources.obsidian += minuteState.robots.obsidian;
    const newGeodes = minuteState.robots.geode;


    const stringifiedMinuteState = JSON.stringify(minuteState);


    if (_canBuildGeode) {
      const newState = JSON.parse(stringifiedMinuteState);
      newState.resources.ore -= bluePrint.geode.ore;
      newState.resources.obsidian -= bluePrint.geode.obsidian;
      newState.robots.geode++;
      scenarios.push(newState);
    }
    if (!onlyGeodes) {
      if (_canBuildObsidian) {
        const newState = JSON.parse(stringifiedMinuteState);
        newState.resources.ore -= bluePrint.obsidian.ore;
        newState.resources.clay -= bluePrint.obsidian.clay;
        newState.robots.obsidian++;
        scenarios.push(newState);
      }
      if (_canBuildClay) {
        const newState = JSON.parse(stringifiedMinuteState);
        newState.resources.ore -= bluePrint.clay.ore;
        newState.robots.clay++;
        scenarios.push(newState);
      }
      if (_canBuildOre) {
        const newState = JSON.parse(stringifiedMinuteState);
        newState.resources.ore -= bluePrint.ore.ore;
        newState.robots.ore++;
        scenarios.push(newState);
      }
      scenarios.push(minuteState);
    }



    const result = Math.max(...scenarios.map(
      (scenario) => {
        return run(scenario, geodes + newGeodes);
      }),
    );
    cache.set(stringifiedState, result);
    if (maxGeodes < result) {
      maxGeodes = result;
      console.log('new max', maxGeodes, 'for index', index, 'and for state', state);
    }

    return result;
  }


  return run(
    {
      resources: {
        ore: 0,
        clay: 0,
        obsidian: 0,
      },
      robots: {
        ore: 1,
        clay: 0,
        obsidian: 0,
        geode: 0,
      },
      minute: 32,
    },
    0,
  );
});

const result = results.reduce((acc, cur) => acc * cur, 1);


console.log(results, result);  // 4212
