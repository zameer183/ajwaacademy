const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processSlides() {
  const generatedSlide2 = 'C:/Users/hp/.gemini/antigravity/brain/d68f3827-86d8-49fb-9525-06e21035d50b/hero_slide_tajweed_1786977123035.jpg';
  const slide1Path = 'public/online-quran-classes-hero-slide-1.webp';
  const slide2Path = 'public/online-quran-classes-hero-slide-2.webp';
  const slide3Path = 'public/online-quran-classes-hero-slide-3.webp';

  const TARGET_W = 1600;
  const TARGET_H = 900;

  // Process Slide 2 from the new generated matched image
  if (fs.existsSync(generatedSlide2)) {
    console.log('Processing new matched slide 2...');
    await sharp(generatedSlide2)
      .resize(TARGET_W, TARGET_H, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(slide2Path);
    console.log('Saved updated slide 2 to:', slide2Path);
  }

  // Optimize Slide 1 to 1600x900 16:9
  console.log('Optimizing slide 1 to standard 16:9...');
  const s1Buffer = fs.readFileSync(slide1Path);
  await sharp(s1Buffer)
    .resize(TARGET_W, TARGET_H, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile('public/online-quran-classes-hero-slide-1-optimized.webp');
  fs.copyFileSync('public/online-quran-classes-hero-slide-1-optimized.webp', slide1Path);
  fs.unlinkSync('public/online-quran-classes-hero-slide-1-optimized.webp');

  // Optimize Slide 3 to 1600x900 16:9
  console.log('Optimizing slide 3 to standard 16:9...');
  const s3Buffer = fs.readFileSync(slide3Path);
  await sharp(s3Buffer)
    .resize(TARGET_W, TARGET_H, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile('public/online-quran-classes-hero-slide-3-optimized.webp');
  fs.copyFileSync('public/online-quran-classes-hero-slide-3-optimized.webp', slide3Path);
  fs.unlinkSync('public/online-quran-classes-hero-slide-3-optimized.webp');

  // Verify all 3
  for (const f of [slide1Path, slide2Path, slide3Path]) {
    const meta = await sharp(f).metadata();
    console.log(`Verified ${f}: ${meta.width}x${meta.height}, format: ${meta.format}`);
  }
}

processSlides().catch(console.error);
