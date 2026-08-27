const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (/\.(jpe?g|png)$/i.test(file)) {
      const originalSize = stat.size;
      const buffer = fs.readFileSync(fullPath);
      
      // Compress in memory
      let pipeline = sharp(buffer);
      const metadata = await pipeline.metadata();

      if (metadata.width && metadata.width > 1200) {
        pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
      }

      if (/\.png$/i.test(file)) {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 9, effort: 8 });
      } else {
        pipeline = pipeline.jpeg({ quality: 78, mozjpeg: true, progressive: true });
      }

      const outputBuffer = await pipeline.toBuffer();
      if (outputBuffer.length < originalSize) {
        fs.writeFileSync(fullPath, outputBuffer);
        console.log(`Compressed ${file}: ${(originalSize / 1024).toFixed(1)}KB -> ${(outputBuffer.length / 1024).toFixed(1)}KB (-${Math.round((1 - outputBuffer.length / originalSize) * 100)}%)`);
      } else {
        console.log(`Skipped ${file}: already optimal`);
      }
    }
  }
}

async function run() {
  const assetsDir = path.join(__dirname, '..', 'assets', 'images');
  console.log('Optimizing images in:', assetsDir);
  await processDirectory(assetsDir);
  console.log('Optimization complete!');
}

run().catch(console.error);
