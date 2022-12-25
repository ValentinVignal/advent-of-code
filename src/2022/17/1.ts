import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const jets: ('<' | '>')[] = textInput.split('\n')[0].split('') as ('<' | '>')[];

const map: Set<number>[] = Array.from(Array(7), () => new Set([0]));

/**
 * the position of the bottom left corner of the piece.
 */
type Position = { x: number, y: number };

/*
0: ####

1: .#.
   ###
   .#.

2: ..#
   ..#
   ###

3: #
   #
   #
   #

4: ##
   ##
 */

const maxX = 7;
let maxY = 0;
const startX = 2;
const startY = 4;
let jetIndex = 0;
class Piece {
  constructor(
    public readonly index: number,
  ) { }

  get type() {
    return this.index % 5;
  }

  canMoveLeft(position: Position): boolean {
    if (position.x === 0) return false;
    switch (this.type) {
      case 0:
        return !map[position.x - 1].has(position.y);
      case 1:
        return (
          // Left column.
          !map[position.x - 1].has(position.y + 1)
          // Middle column. No need to check for the middle.
          && !map[position.x].has(position.y) && !map[position.x].has(position.y + 2)
          // Right column.
          // No need to check the right column.
        );
      case 2:
        return (
          // Left column.
          !map[position.x - 1].has(position.y)
          // Middle column.
          // Nothing to check
          // Right column.
          && !map[position.x + 1].has(position.y + 1) && !map[position.x + 1].has(position.y + 2)
        );
      case 3:
        for (let i = 0; i < 4; i++) {
          if (map[position.x - 1].has(position.y + i)) return false;
        }
        return true;
      case 4:
        for (let i = 0; i < 2; i++) {
          if (map[position.x - 1].has(position.y + i)) return false;
        }
        return true;
      default:
        throw new Error('Invalid type');
    }
  }

  canMoveRight(position: Position): boolean {
    switch (this.type) {
      case 0:
        return position.x + 4 < maxX && !map[position.x + 4].has(position.y);
      case 1:
        if (position.x + 3 >= maxX) return false;
        return (
          // Left column.
          // No need to check the left column.
          // Middle column. No need to check for the middle.
          !map[position.x + 2].has(position.y) && !map[position.x + 2].has(position.y + 2)
          // Right column.
          && !map[position.x + 3].has(position.y + 1)
        );
      case 2:
        if (position.x + 3 >= maxX) return false;
        return (
          // Left column.
          // No need to check the left column.
          // Middle column.
          // Nothing to check.
          // Right column.
          !map[position.x + 3].has(position.y) && !map[position.x + 3].has(position.y + 1) && !map[position.x + 3].has(position.y + 2)
        );
      case 3:
        if (position.x + 1 >= maxX) return false;
        for (let i = 0; i < 4; i++) {
          if (map[position.x + 1].has(position.y + i)) return false;
        }
        return true;
      case 4:
        if (position.x + 2 >= maxX) return false;
        for (let i = 0; i < 2; i++) {
          if (map[position.x + 2].has(position.y + i)) return false;
        }
        return true;
      default:
        throw new Error('Invalid type');
    }
  }

  canMoveDown(position: Position): boolean {
    if (position.y === 1) return false;
    switch (this.type) {
      case 0:
        for (let i = 0; i < 4; i++) {
          if (map[position.x + i].has(position.y - 1)) return false;
        }
        return true;
      case 1:
        return (
          // Left column.
          !map[position.x].has(position.y)
          // Middle column.
          && !map[position.x + 1].has(position.y - 1)
          // Right column.
          && !map[position.x + 2].has(position.y)
        );
      case 2:
        return (
          // Left column.
          !map[position.x].has(position.y - 1)
          // Middle column.
          && !map[position.x + 1].has(position.y - 1)
          // Right column.
          && !map[position.x + 2].has(position.y - 1)
        );
      case 3:
        return !map[position.x].has(position.y - 1);
      case 4:
        for (let i = 0; i < 2; i++) {
          if (map[position.x + i].has(position.y - 1)) return false;
        }
        return true;
      default:
        throw new Error('Invalid type');
    }
  }

  lock(position: Position): void {
    switch (this.type) {
      case 0:
        for (let i = 0; i < 4; i++) {
          map[position.x + i].add(position.y);
        }
        break;
      case 1:
        map[position.x].add(position.y + 1);
        map[position.x + 1].add(position.y);
        map[position.x + 1].add(position.y + 1);
        map[position.x + 1].add(position.y + 2);
        map[position.x + 2].add(position.y + 1);
        break;
      case 2:
        map[position.x].add(position.y);
        map[position.x + 1].add(position.y);
        map[position.x + 2].add(position.y);
        map[position.x + 2].add(position.y + 1);
        map[position.x + 2].add(position.y + 2);
        break;
      case 3:
        for (let i = 0; i < 4; i++) {
          map[position.x].add(position.y + i);
        }
        break;
      case 4:
        for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 2; y++) {
            map[position.x + x].add(position.y + y);
          }
        }
        break;
      default:
        throw new Error('Invalid type');
    }
  }

  /**
   * The highest y position of the piece.
   */
  maxY(position: Position): number {
    switch (this.type) {
      case 0:
        return position.y;
      case 1:
        return position.y + 2;
      case 2:
        return position.y + 2;
      case 3:
        return position.y + 3;
      case 4:
        return position.y + 1;
      default:
        return position.y;
    }
  }
}

for (let pieceIndex = 0; pieceIndex < 2022; pieceIndex++) {
  const piece = new Piece(pieceIndex);
  /** Left bottom corner */
  let position = { x: startX, y: startY + maxY };

  while (true) {
    const jet = jets[jetIndex % jets.length];
    jetIndex++;

    // Jet
    if (jet === '<') {
      if (piece.canMoveLeft(position)) {
        position.x--;
      }
    } else {
      if (piece.canMoveRight(position)) {
        position.x++;
      }
    }

    // Fall down.
    if (piece.canMoveDown(position)) {
      position.y--;
    } else {
      piece.lock(position);
      maxY = Math.max(maxY, piece.maxY(position));
      break;
    }
  }
}




const result = map.reduce((acc, values) => {
  return Math.max(acc, ...values);
}, 0);
console.log('maxY in sync', 'maxY:', maxY, 'result:', result);

// 2859 < x < 3109 < 3110
console.log(result);
