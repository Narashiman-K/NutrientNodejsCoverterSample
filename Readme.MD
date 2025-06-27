# Nutrient Node.js Document Converter

## 🎯 Overview

A comprehensive Node.js solution for converting Office documents (DOCX, PPTX, XLSX) to PDF using the Nutrient SDK, with batch processing capabilities and Windows compatibility solutions.

## 🚨 Windows Path Issue & Solution

### The Problem

On Windows, the Node.js ES module loader expects `file://` URLs for paths, but drive-letter paths like `D:\path\to\file` are not handled, causing:

```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'd:'
```

### The Solution

Use WSL (Windows Subsystem for Linux) or a native Linux/macOS environment:

```bash
# Open WSL terminal
wsl

# Navigate to your project
cd /mnt/d/your-project-path

# Run conversions normally
node converter.mjs
```

## 🔧 Prerequisites

- **Node.js 18+** (in WSL/Linux environment)
- **WSL2** (for Windows users) or **native Linux/macOS**
- **Nutrient SDK license** (optional, includes watermark without license)

### Installing WSL (Windows Users)

```powershell
# Install WSL
wsl --install

# Or install a specific distribution
wsl --install -d Ubuntu-22.04

# Update WSL
wsl --update
```

### Installing Node.js in WSL

```bash
# Update system
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/Narashiman-K/NutrientNodejsCoverterSample.git
cd NutrientNodejsCoverterSample

# Install dependencies
npm install
```

## 📁 Project Structure

```text
nutrient-nodejs-converter/
├── README.md
├── package.json
├── .gitignore
├── converter.mjs            # Single-file conversion script
├── batch-converter.mjs      # Batch processing with advanced features
├── run-batch.mjs            # Simple batch runner
├── advanced-batch.mjs       # Advanced batch processing options
├── converted-pdfs/          # Output directory (auto-created)
├── batch-converted/         # Batch output directory (auto-created)
└── conversion-log.txt       # Detailed conversion logs
```

## 🔄 Usage

### Single File Conversion

```javascript
// converter.mjs
import { load } from '@nutrient-sdk/node';
import fs from 'fs';

const docxBuffer = fs.readFileSync('document.docx');
const instance = await load({ document: docxBuffer });
const pdfBuffer = await instance.exportPDF();
fs.writeFileSync('output.pdf', Buffer.from(pdfBuffer));
await instance.close();
```

Run the script:

```bash
node converter.mjs
```

### Batch Processing

```bash
# Simple batch conversion
npm run batch

# Advanced batch with options
npm run batch-advanced

# Custom batch run
node run-batch.mjs
```

## Batch Processing Features

- ✅ **Concurrent Processing** (configurable)
- ✅ **Progress Tracking** with real-time updates
- ✅ **Error Handling** - Continues on individual failures
- ✅ **Detailed Logging** with timestamps
- ✅ **Smart Skip** - Avoids re-converting existing files
- ✅ **Comprehensive Reports** - Success rates, file sizes, timing
- ✅ **Memory Management** - Proper cleanup to prevent leaks

## ⚙️ Configuration Options

```javascript
const options = {
  inputFolder: '/mnt/d/your-documents',     // Source folder
  outputFolder: './converted-pdfs',         // Output folder
  maxConcurrent: 3,                         // Concurrent processing limit
  supportedExtensions: ['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls']
};
```

## 📊 Sample Output

```text
🚀 Starting batch conversion process...
📁 Found 15 office documents in /mnt/d/documents
🔄 12 files need conversion (3 already converted)

📋 Files to convert:
1. annual-report.docx
2. presentation.pptx
3. budget-2024.xlsx
...

🔄 Starting conversion of 12 files...
⚙️  Processing 3 files concurrently

📦 Processing batch 1/4 (3 files)
✅ SUCCESS: annual-report.docx (245.67KB -> 198.34KB) in 3.45s
✅ SUCCESS: presentation.pptx (1406.46KB -> 892.15KB) in 5.23s
✅ SUCCESS: budget-2024.xlsx (13.64KB -> 25.89KB) in 2.11s

╔════════════════════════════════════════════════════════════════╗
║                     BATCH CONVERSION REPORT                    ║
╠════════════════════════════════════════════════════════════════╣
║ Total Files Processed:  12                                     ║
║ Successful:             11                                     ║
║ Failed:                  1                                     ║
║ Success Rate:          91.7%                                   ║
║                                                                ║
║ Total Input Size:    2847.23 KB                               ║
║ Total Output Size:   2156.78 KB                               ║
║ Compression Ratio:    24.3%                                   ║
║ Total Duration:        45.67 seconds                          ║
║ Average per File:       3.81 seconds                          ║
╚════════════════════════════════════════════════════════════════╝
```

## 🛠️ Troubleshooting

### Issue: Cannot find module '@nutrient-sdk/node'

```bash
npm install @nutrient-sdk/node
```

### Issue: Windows path errors

Use WSL:

```bash
wsl
cd /mnt/d/your-project
node converter.mjs
```

### Issue: Permission denied

```bash
sudo chown -R $USER:$USER /mnt/d/your-project
```

### Issue: Large files timeout

Increase processing time or reduce concurrency:

```javascript
const options = {
  maxConcurrent: 1,  // Process one at a time
  timeout: 300000    // 5 minutes timeout
};
```

## 📝 Package.json Scripts

```json
{
  "scripts": {
    "convert": "node converter.mjs",
    "batch": "node batch-converter.mjs",
    "batch-run": "node run-batch.mjs",
    "batch-advanced": "node advanced-batch.mjs"
  }
}
```

## 🐛 Issues & Workarounds

### Windows Compatibility

**Issue:** ES module path resolution fails on Windows  
**Workaround:** Use WSL or a Linux environment

### File Permissions

**Issue:** WSL file permission problems  
**Workaround:** Use `sudo chown` or adjust WSL mount options

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch: `git checkout -b feature/amazing-feature`  
3. Commit your changes: `git commit -m "Add amazing feature"`  
4. Push to the branch: `git push origin feature/amazing-feature`  
5. Open a Pull Request

## 🙏 Acknowledgments

- Nutrient for the powerful document processing SDK  
- The Node.js community for excellent tooling  
- WSL team for making Windows-Linux interoperability seamless

## 📧 Support

For issues related to:  
- **Nutrient SDK:** https://support.nutrient.io/hc/en-us/requests/new  
- **WSL:** Check Microsoft WSL Documentation

## Author

[Narashiman](https://www.linkedin.com/in/narashimank/)
