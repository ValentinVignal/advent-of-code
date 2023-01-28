import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Binary = '0' | '1';

const input: Binary[] = textInput.split('\n')[0].split('').map((hex) => {
  return parseInt(hex, 16).toString(2).padStart(4, '0');
}).join('').split('') as Binary[];
type PacketBase = {
  version: number;
}

type Literal = PacketBase & {
  type: 4,
  value: number;
}

type Operator = PacketBase & {
  type: number;
  subPackets: Packet[];
}
type Packet = Literal | Operator;


const buildTree = (binaryPackets: Binary[]): Packet[] => {
  if (binaryPackets.length < 10) {
    // This might be the remaining bits of the outer most packet.
    return [];
  }
  const version = parseInt(binaryPackets.slice(0, 3).join(''), 2);
  const type = parseInt(binaryPackets.slice(3, 6).join(''), 2);
  if (type === 4) {
    // This is a literal.
    const subPacket = binaryPackets.slice(6);
    let stringLiteral = '';
    for (let index = 0; index < subPacket.length; index += 5) {
      const start = subPacket[index];
      stringLiteral += subPacket.slice(index + 1, index + 5).join('');
      if (start === '0') {
        // This is the last one
        break;
      }
    }
    const value = parseInt(stringLiteral, 2);
    const bitsNumber = (6 + stringLiteral.length * 5 / 4);
    const packets: Packet[] = [{
      version,
      type,
      value,
    }];
    packets.push(...buildTree(binaryPackets.slice(bitsNumber)));
    return packets;
  } else {
    // This is an operator.
    const lengthTypeId = binaryPackets[6];
    let subPackets: Packet[];
    let nextPackets: Packet[];
    if (lengthTypeId === '0') {
      // The length is a 15-bit number representing the number of bits in the
      // sub-packets.
      const l = parseInt(binaryPackets.slice(7, 22).join(''), 2);
      const subBinaryPackets = binaryPackets.slice(22, 22 + l);
      subPackets = buildTree(subBinaryPackets);
      nextPackets = buildTree(binaryPackets.slice(22 + l));
    } else {
      // The length is a 11-bit number representing the number of sub-packets.
      const l = parseInt(binaryPackets.slice(7, 18).join(''), 2);
      const packets = buildTree(binaryPackets.slice(18));
      subPackets = packets.slice(0, l);
      nextPackets = packets.slice(l);
    }
    return [
      {
        version,
        type,
        subPackets,
      },
      ...nextPackets,
    ]
  }
}

const packetTree = buildTree(input)[0];

const sumVersions = (packet: Packet): number => {
  if (packet.type === 4) {
    return packet.version;
  }
  return (packet as Operator).subPackets.reduce((sum, subPacket) => sum + sumVersions(subPacket), packet.version);
}

const result = sumVersions(packetTree);

console.log(result); // 949
