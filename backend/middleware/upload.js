import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

// File size limit (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error('Invalid file type. Only images are allowed.');
    error.code = 'LIMIT_FILE_TYPE';
    return cb(error, false);
  }
  cb(null, true);
};

// Multer instance configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Limit to single file upload
  }
});

// Middleware wrapper for better error handling
const handleUpload = (fieldName) => {
  return (req, res, next) => {
    const uploadInstance = upload.single(fieldName);
    
    uploadInstance(req, res, function (err) {
      if (err) {
        let message = 'File upload failed';
        let status = 400;

        if (err.code === 'LIMIT_FILE_TYPE') {
          message = 'Invalid file type. Only images (JPEG, PNG, GIF, WEBP, SVG) are allowed.';
        } else if (err.code === 'LIMIT_FILE_SIZE') {
          message = `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          message = 'Too many files uploaded. Only single file is allowed.';
        } else {
          message = err.message;
          status = 500;
        }

        return res.status(status).json({
          success: false,
          message: message
        });
      }

      // File validation after upload (additional check)
      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        
        if (!allowedExtensions.includes(ext)) {
          // Delete the uploaded file if extension doesn't match
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            message: 'Invalid file extension.'
          });
        }
      }

      next();
    });
  };
};

export default handleUpload;