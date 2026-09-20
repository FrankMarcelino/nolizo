import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/**
 * Quadrado solido com um "N" em blocos, na cor dourada do tema.
 * Grade 10x10: hastes em gx 1-2 e 7-8, diagonal descendo entre elas.
 * Geometria ja verificada — renderiza um N legivel em 192 e 512.
 */
function png(size, bg, fg) {
  const raw = [];
  const G = 10;
  const m = size / G;
  for (let y = 0; y < size; y++) {
    const row = [0];
    for (let x = 0; x < size; x++) {
      const gx = Math.floor(x / m), gy = Math.floor(y / m);
      const d = 1 + ((gy - 1) * 5) / 7;
      const isN =
        gy >= 1 && gy <= 8 && gx >= 1 && gx <= 8 &&
        ((gx <= 2) || (gx >= 7) || Math.abs(gx - (d + 1)) < 1.15);
      const c = isN ? fg : bg;
      row.push(c[0], c[1], c[2], 255);
    }
    raw.push(Buffer.from(row));
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(raw))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public", { recursive: true });
const BG = [11, 15, 25];      // #0b0f19
const FG = [212, 166, 71];    // #d4a647
writeFileSync("public/icon-192.png", png(192, BG, FG));
writeFileSync("public/icon-512.png", png(512, BG, FG));
console.log("icones gerados");
