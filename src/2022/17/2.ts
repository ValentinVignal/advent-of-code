import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const jets: ('<' | '>')[] = textInput.split('\n')[0].split('') as ('<' | '>')[];


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
const startX = 2;
const startY = 4;
class Piece {
  constructor(
    public readonly index: number,
    private map: Set<number>[],
  ) { }

  get type() {
    return this.index % 5;
  }

  canMoveLeft(position: Position): boolean {
    if (position.x === 0) return false;
    switch (this.type) {
      case 0:
        return !this.map[position.x - 1].has(position.y);
      case 1:
        return (
          // Left column.
          !this.map[position.x - 1].has(position.y + 1)
          // Middle column. No need to check for the middle.
          && !this.map[position.x].has(position.y) && !this.map[position.x].has(position.y + 2)
          // Right column.
          // No need to check the right column.
        );
      case 2:
        return (
          // Left column.
          !this.map[position.x - 1].has(position.y)
          // Middle column.
          // Nothing to check
          // Right column.
          && !this.map[position.x + 1].has(position.y + 1) && !this.map[position.x + 1].has(position.y + 2)
        );
      case 3:
        for (let i = 0; i < 4; i++) {
          if (this.map[position.x - 1].has(position.y + i)) return false;
        }
        return true;
      case 4:
        for (let i = 0; i < 2; i++) {
          if (this.map[position.x - 1].has(position.y + i)) return false;
        }
        return true;
      default:
        throw new Error('Invalid type');
    }
  }

  canMoveRight(position: Position): boolean {
    switch (this.type) {
      case 0:
        return position.x + 4 < maxX && !this.map[position.x + 4].has(position.y);
      case 1:
        if (position.x + 3 >= maxX) return false;
        return (
          // Left column.
          // No need to check the left column.
          // Middle column. No need to check for the middle.
          !this.map[position.x + 2].has(position.y) && !this.map[position.x + 2].has(position.y + 2)
          // Right column.
          && !this.map[position.x + 3].has(position.y + 1)
        );
      case 2:
        if (position.x + 3 >= maxX) return false;
        return (
          // Left column.
          // No need to check the left column.
          // Middle column.
          // Nothing to check.
          // Right column.
          !this.map[position.x + 3].has(position.y) && !this.map[position.x + 3].has(position.y + 1) && !this.map[position.x + 3].has(position.y + 2)
        );
      case 3:
        if (position.x + 1 >= maxX) return false;
        for (let i = 0; i < 4; i++) {
          if (this.map[position.x + 1].has(position.y + i)) return false;
        }
        return true;
      case 4:
        if (position.x + 2 >= maxX) return false;
        for (let i = 0; i < 2; i++) {
          if (this.map[position.x + 2].has(position.y + i)) return false;
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
          if (this.map[position.x + i].has(position.y - 1)) return false;
        }
        return true;
      case 1:
        return (
          // Left column.
          !this.map[position.x].has(position.y)
          // Middle column.
          && !this.map[position.x + 1].has(position.y - 1)
          // Right column.
          && !this.map[position.x + 2].has(position.y)
        );
      case 2:
        return (
          // Left column.
          !this.map[position.x].has(position.y - 1)
          // Middle column.
          && !this.map[position.x + 1].has(position.y - 1)
          // Right column.
          && !this.map[position.x + 2].has(position.y - 1)
        );
      case 3:
        return !this.map[position.x].has(position.y - 1);
      case 4:
        for (let i = 0; i < 2; i++) {
          if (this.map[position.x + i].has(position.y - 1)) return false;
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
          this.map[position.x + i].add(position.y);
        }
        break;
      case 1:
        this.map[position.x].add(position.y + 1);
        this.map[position.x + 1].add(position.y);
        this.map[position.x + 1].add(position.y + 1);
        this.map[position.x + 1].add(position.y + 2);
        this.map[position.x + 2].add(position.y + 1);
        break;
      case 2:
        this.map[position.x].add(position.y);
        this.map[position.x + 1].add(position.y);
        this.map[position.x + 2].add(position.y);
        this.map[position.x + 2].add(position.y + 1);
        this.map[position.x + 2].add(position.y + 2);
        break;
      case 3:
        for (let i = 0; i < 4; i++) {
          this.map[position.x].add(position.y + i);
        }
        break;
      case 4:
        for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 2; y++) {
            this.map[position.x + x].add(position.y + y);
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
        throw new Error('Invalid type');
    }
  }
}

type Result = {
  maxY: number;
  map: Set<number>[];
}

const simulate = (n: number): Result => {
  const map: Set<number>[] = Array.from(Array(7), () => new Set([0]));
  let maxY = 0;
  let jetIndex = 0;
  for (let pieceIndex = 0; pieceIndex < n; pieceIndex++) {

    const piece = new Piece(pieceIndex, map);
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
  return { maxY, map };
}

const intermediateResult = simulate(5000);


// 1540057636876 < x < ?
// console.log(result); // 1540634005751
