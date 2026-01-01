import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const voiceDir = path.join(uploadDir, 'voice');
const imageDir = path.join(uploadDir, 'images');
const fileDir = path.join(uploadDir, 'files');

[uploadDir, voiceDir, imageDir, fileDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    if (file.mimetype.startsWith('audio/')) {
      uploadPath = voiceDir;
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = imageDir;
    } else {
      uploadPath = fileDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter with security checks
const fileFilter = (req, file, cb) => {
  // Allowed file types with strict validation
  const allowedTypes = {
    voice: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    file: ['application/pdf', 'text/plain', 'application/msword', 
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const allAllowed = [...allowedTypes.voice, ...allowedTypes.image, ...allowedTypes.file];
  
  // Strict MIME type validation
  if (allAllowed.includes(file.mimetype)) {
    // Additional security: Check file extension matches MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeToExt = {
      'audio/mpeg': ['.mp3', '.mpeg'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/webm': ['.webm'],
      'audio/mp4': ['.mp4', '.m4a'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    };
    
    const validExts = mimeToExt[file.mimetype] || [];
    if (validExts.length === 0 || validExts.includes(ext)) {
      // Sanitize filename to prevent path traversal
      file.originalname = path.basename(file.originalname);
      cb(null, true);
    } else {
      cb(new Error('File extension does not match MIME type'), false);
    }
  } else {
    cb(new Error('Invalid file type. Only audio, image, PDF and text files are allowed.'), false);
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Specific upload configurations
export const uploadVoice = upload.single('voice');
export const uploadImage = upload.single('image');
export const uploadFile = upload.single('file');
export const uploadMultiple = upload.array('files', 5); // Max 5 files

// Helper to generate file URL
export const getFileUrl = (req, filename, type = 'files') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};
