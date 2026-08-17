const sharp = require('sharp');

async function analyze() {
  const { data, info } = await sharp('public/ajwa-logo.png')
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  console.log(`Image dimensions: ${info.width}x${info.height}, channels: ${info.channels}`);
  const colorBuckets = {};

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = info.channels === 4 ? data[i + 3] : 255;

    // Ignore fully transparent or pure white/near-white backgrounds
    if (a < 50) continue;
    if (r > 240 && g > 240 && b > 240) continue;

    // Quantize to groups of 8
    const qr = Math.floor(r / 8) * 8;
    const qg = Math.floor(g / 8) * 8;
    const qb = Math.floor(b / 8) * 8;
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    const key = `#${qr.toString(16).padStart(2, '0')}${qg.toString(16).padStart(2, '0')}${qb.toString(16).padStart(2, '0')}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = { count: 0, sampleHex: hex, r, g, b };
    }
    colorBuckets[key].count++;
  }

  const sorted = Object.values(colorBuckets)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  console.log('Top Logo Colors (excluding white/transparent):');
  sorted.forEach((c, idx) => {
    console.log(`${idx + 1}. Hex: ${c.sampleHex} (R:${c.r}, G:${c.g}, B:${c.b}) — pixels: ${c.count}`);
  });
}

analyze().catch(console.error);
