// converter.mjs
import fs from 'fs';
import path from 'path';
import { load } from '@nutrient-sdk/node';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertDocument() {
  try {
    console.log('🔄 Starting conversion...');
    
    const inputFile = path.join(__dirname, 'test-document.docx');
    const outputFile = path.join(__dirname, 'converted-output.pdf');
    
    if (!fs.existsSync(inputFile)) {
      console.error('❌ Input file not found:', inputFile);
      return;
    }
    
    console.log('📄 Reading document...');
    const documentBuffer = fs.readFileSync(inputFile);
    
    console.log('🔄 Loading document...');
    const instance = await load({
      document: documentBuffer
    });
    
    console.log('📝 Converting to PDF...');
    const pdfBuffer = await instance.exportPDF();
    
    console.log('💾 Saving PDF...');
    fs.writeFileSync(outputFile, Buffer.from(pdfBuffer));
    
    await instance.close();
    
    console.log('✅ SUCCESS!');
    console.log(`📁 Output: ${outputFile}`);
    
    const stats = fs.statSync(outputFile);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

convertDocument();