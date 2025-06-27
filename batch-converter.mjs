// batch-converter.mjs
import fs from 'fs';
import path from 'path';
import { load } from '@nutrient-sdk/node';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BatchConverter {
  constructor(options = {}) {
    this.inputFolder = options.inputFolder || '/mnt/d/pspdfkit-assets'; // change this to your needs - Default input folder
    this.outputFolder = options.outputFolder || path.join(__dirname, 'batch-converted');
    this.supportedExtensions = ['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'];
    this.maxConcurrent = options.maxConcurrent || 3; // Process 3 files at a time
    this.logFile = path.join(__dirname, 'conversion-log.txt');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputFolder)) {
      fs.mkdirSync(this.outputFolder, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // Also write to log file
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async getFilesToConvert() {
    try {
      if (!fs.existsSync(this.inputFolder)) {
        throw new Error(`Input folder not found: ${this.inputFolder}`);
      }

      const allFiles = fs.readdirSync(this.inputFolder);
      const officeFiles = allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return this.supportedExtensions.includes(ext);
      });

      this.log(`📁 Found ${officeFiles.length} office documents in ${this.inputFolder}`);
      
      // Filter out already converted files
      const unconvertedFiles = officeFiles.filter(file => {
        const outputFileName = path.basename(file, path.extname(file)) + '.pdf';
        const outputPath = path.join(this.outputFolder, outputFileName);
        return !fs.existsSync(outputPath);
      });

      this.log(`🔄 ${unconvertedFiles.length} files need conversion (${officeFiles.length - unconvertedFiles.length} already converted)`);
      
      return unconvertedFiles;
      
    } catch (error) {
      this.log(`❌ Error scanning files: ${error.message}`);
      return [];
    }
  }

  async convertSingleFile(fileName) {
    const startTime = Date.now();
    let instance = null;
    
    try {
      this.log(`🔄 Starting conversion: ${fileName}`);
      
      const inputPath = path.join(this.inputFolder, fileName);
      const outputFileName = path.basename(fileName, path.extname(fileName)) + '.pdf';
      const outputPath = path.join(this.outputFolder, outputFileName);
      
      // Read the document
      const documentBuffer = fs.readFileSync(inputPath);
      const fileSizeKB = (documentBuffer.length / 1024).toFixed(2);
      
      // Load and convert
      instance = await load({ document: documentBuffer });
      const pdfBuffer = await instance.exportPDF();
      
      // Save the PDF
      fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const outputSizeKB = ((await fs.promises.stat(outputPath)).size / 1024).toFixed(2);
      
      this.log(`✅ SUCCESS: ${fileName} (${fileSizeKB}KB -> ${outputSizeKB}KB) in ${duration}s`);
      
      return {
        success: true,
        fileName,
        inputSize: fileSizeKB,
        outputSize: outputSizeKB,
        duration: duration,
        outputPath
      };
      
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.log(`❌ FAILED: ${fileName} after ${duration}s - ${error.message}`);
      
      return {
        success: false,
        fileName,
        error: error.message,
        duration: duration
      };
    } finally {
      if (instance) {
        try {
          await instance.close();
        } catch (closeError) {
          this.log(`⚠️  Warning: Failed to close instance for ${fileName}: ${closeError.message}`);
        }
      }
    }
  }

  async convertBatch(fileNames) {
    const results = [];
    const chunks = this.chunkArray(fileNames, this.maxConcurrent);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      this.log(`📦 Processing batch ${i + 1}/${chunks.length} (${chunk.length} files)`);
      
      // Process files in current chunk concurrently
      const chunkPromises = chunk.map(fileName => this.convertSingleFile(fileName));
      const chunkResults = await Promise.all(chunkPromises);
      
      results.push(...chunkResults);
      
      // Small delay between batches to prevent overload
      if (i < chunks.length - 1) {
        this.log(`⏳ Waiting 2 seconds before next batch...`);
        await this.delay(2000);
      }
    }
    
    return results;
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const totalInputSize = successful.reduce((sum, r) => sum + parseFloat(r.inputSize), 0);
    const totalOutputSize = successful.reduce((sum, r) => sum + parseFloat(r.outputSize), 0);
    const totalDuration = results.reduce((sum, r) => sum + parseFloat(r.duration), 0);
    
    const report = `
╔════════════════════════════════════════════════════════════════╗
║                     BATCH CONVERSION REPORT                    ║
╠════════════════════════════════════════════════════════════════╣
║ Total Files Processed: ${results.length.toString().padStart(3)}                               ║
║ Successful:            ${successful.length.toString().padStart(3)}                               ║
║ Failed:                ${failed.length.toString().padStart(3)}                               ║
║ Success Rate:          ${((successful.length / results.length) * 100).toFixed(1).padStart(5)}%                          ║
║                                                                ║
║ Total Input Size:      ${totalInputSize.toFixed(2).padStart(8)} KB                        ║
║ Total Output Size:     ${totalOutputSize.toFixed(2).padStart(8)} KB                        ║
║ Compression Ratio:     ${totalInputSize > 0 ? ((1 - totalOutputSize/totalInputSize) * 100).toFixed(1) : '0.0'}%                            ║
║ Total Duration:        ${totalDuration.toFixed(2).padStart(8)} seconds                    ║
║ Average per File:      ${(totalDuration/results.length).toFixed(2).padStart(8)} seconds                    ║
╚════════════════════════════════════════════════════════════════╝

📁 Output Directory: ${this.outputFolder}
📋 Log File: ${this.logFile}
`;

    this.log(report);

    if (failed.length > 0) {
      this.log('\n❌ FAILED FILES:');
      failed.forEach((result, index) => {
        this.log(`${index + 1}. ${result.fileName} - ${result.error}`);
      });
    }

    if (successful.length > 0) {
      this.log('\n✅ SUCCESSFULLY CONVERTED:');
      successful.forEach((result, index) => {
        this.log(`${index + 1}. ${result.fileName} -> ${path.basename(result.outputPath)}`);
      });
    }
  }

  async run() {
    const startTime = Date.now();
    this.log('🚀 Starting batch conversion process...');
    
    try {
      // Get files to convert
      const filesToConvert = await this.getFilesToConvert();
      
      if (filesToConvert.length === 0) {
        this.log('🎉 No files to convert. All files are already processed!');
        return;
      }
      
      // Show file list
      this.log('\n📋 Files to convert:');
      filesToConvert.forEach((file, index) => {
        this.log(`${index + 1}. ${file}`);
      });
      
      this.log(`\n🔄 Starting conversion of ${filesToConvert.length} files...`);
      this.log(`⚙️  Processing ${this.maxConcurrent} files concurrently`);
      
      // Convert files
      const results = await this.convertBatch(filesToConvert);
      
      // Generate report
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      this.log(`\n⏱️  Total processing time: ${totalTime} seconds`);
      
      this.generateReport(results);
      
    } catch (error) {
      this.log(`❌ Batch conversion failed: ${error.message}`);
    }
  }
}

// Interactive mode
async function interactiveMode() {
  console.log('🎯 Nutrient Batch Converter - Interactive Mode\n');
  
  // You can customize these options
  const options = {
    inputFolder: '/mnt/d/pspdfkit-assets',
    outputFolder: path.join(__dirname, 'batch-converted'),
    maxConcurrent: 3
  };
  
  console.log('📂 Configuration:');
  console.log(`   Input Folder:  ${options.inputFolder}`);
  console.log(`   Output Folder: ${options.outputFolder}`);
  console.log(`   Concurrent:    ${options.maxConcurrent} files at a time`);
  console.log('');
  
  const converter = new BatchConverter(options);
  await converter.run();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  interactiveMode();
}

export { BatchConverter };