// run-batch.mjs
import { BatchConverter } from './batch-converter.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 Nutrient Batch PDF Converter\n');
  
  // Configuration options
  const options = {
    inputFolder: '/mnt/d/pspdfkit-assets',           // Your source folder
    outputFolder: path.join(__dirname, 'converted-pdfs'), // Output folder
    maxConcurrent: 2                                 // Process 2 files at once (adjust based on system)
  };
  
  const converter = new BatchConverter(options);
  await converter.run();
  
  console.log('\n🎉 Batch conversion completed!');
  console.log(`📁 Check your converted files in: ${options.outputFolder}`);
}

main();