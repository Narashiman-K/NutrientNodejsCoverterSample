// advanced-batch.mjs
import { BatchConverter } from './batch-converter.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSpecificFiles() {
  const converter = new BatchConverter({
    inputFolder: '/mnt/d/pspdfkit-assets', // Adjust this path to your input folder
    outputFolder: path.join(__dirname, 'converted-pdfs'),
    maxConcurrent: 1 // Process one at a time for large files
  });
  
  // Get all available files
  const allFiles = await converter.getFilesToConvert();
  
  // Filter for specific file types or names
  const docxFiles = allFiles.filter(f => f.toLowerCase().endsWith('.docx'));
  const pptxFiles = allFiles.filter(f => f.toLowerCase().endsWith('.pptx'));
  
  console.log(`📄 Found ${docxFiles.length} DOCX files`);
  console.log(`🎯 Found ${pptxFiles.length} PPTX files`);
  
  // Convert only DOCX files first
  if (docxFiles.length > 0) {
    console.log('\n🔄 Converting DOCX files...');
    const docxResults = await converter.convertBatch(docxFiles);
    converter.generateReport(docxResults);
  }
  
  // Then convert PPTX files
  if (pptxFiles.length > 0) {
    console.log('\n🔄 Converting PPTX files...');
    const pptxResults = await converter.convertBatch(pptxFiles);
    converter.generateReport(pptxResults);
  }
}

// Run specific conversion
convertSpecificFiles();