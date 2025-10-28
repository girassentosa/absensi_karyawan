/**
 * Script to download face-api.js model files
 * Run with: node scripts/download-models.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

// Model files to download
const MODEL_FILES = [
  // Tiny Face Detector
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  
  // Face Landmark 68
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  
  // Face Recognition
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
];

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log('✅ Created models directory');
}

/**
 * Download a single file
 */
function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const url = `${MODEL_BASE_URL}/${filename}`;
    const dest = path.join(MODELS_DIR, filename);
    
    // Skip if file already exists
    if (fs.existsSync(dest)) {
      console.log(`⏭️  Skipped: ${filename} (already exists)`);
      resolve();
      return;
    }
    
    console.log(`📥 Downloading: ${filename}...`);
    
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete partial file
      reject(err);
    });
  });
}

/**
 * Download all model files
 */
async function downloadAllModels() {
  console.log('🚀 Starting face-api.js model download...\n');
  console.log(`📁 Destination: ${MODELS_DIR}\n`);
  
  try {
    for (const filename of MODEL_FILES) {
      await downloadFile(filename);
    }
    
    console.log('\n✅ All models downloaded successfully!');
    console.log('🎉 Face recognition is ready to use!');
    
  } catch (error) {
    console.error('\n❌ Error downloading models:', error.message);
    console.error('\n📋 Manual download instructions:');
    console.error('1. Visit: https://github.com/justadudewhohacks/face-api.js/tree/master/weights');
    console.error(`2. Download all model files to: ${MODELS_DIR}`);
    process.exit(1);
  }
}

// Run download
downloadAllModels();

