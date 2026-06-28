const fs = require('fs');
const { Jimp, intToRGBA, rgbaToInt, JimpMime } = require('jimp');

async function main() {
  const b64 = fs.readFileSync('original_base64.txt', 'utf8');
  const buffer = Buffer.from(b64, 'base64');
  
  const image = await Jimp.read(buffer);
  
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = intToRGBA(image.getPixelColor(x, y));
      // strict threshold for pure white background, but let's do > 245
      if (color.r > 245 && color.g > 245 && color.b > 245) {
        image.setPixelColor(rgbaToInt(color.r, color.g, color.b, 0), x, y);
      }
    }
  }
  
  const outBuffer = await image.getBuffer(JimpMime.png);
  const outB64 = outBuffer.toString('base64');
  fs.writeFileSync('new_base64.txt', outB64);
  console.log('Saved new_base64.txt');
}

main().catch(console.error);
