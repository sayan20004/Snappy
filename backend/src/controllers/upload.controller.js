import { AppError } from '../middleware/error.middleware.js';
import { getFileUrl } from '../config/upload.js';
import path from 'path';
import fs from 'fs';

// @desc    Upload voice note
// @route   POST /api/upload/voice
// @access  Private
export const uploadVoiceNote = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const fileUrl = getFileUrl(req, req.file.filename, 'voice');
    
    res.status(201).json({
      message: 'Voice note uploaded successfully',
      file: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    next(error);
  }
};

// @desc    Upload image/screenshot
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No image uploaded', 400);
    }

    const imageUrl = getFileUrl(req, req.file.filename, 'images');
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      file: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        dimensions: req.body.dimensions || null // Optional: can be sent from frontend
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    next(error);
  }
};

// @desc    Upload general file
// @route   POST /api/upload/file
// @access  Private
export const uploadGeneralFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const fileUrl = getFileUrl(req, req.file.filename, 'files');
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    next(error);
  }
};

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const uploadedFiles = req.files.map(file => {
      const type = file.mimetype.startsWith('image/') ? 'images' : 
                   file.mimetype.startsWith('audio/') ? 'voice' : 'files';
      
      return {
        url: getFileUrl(req, file.filename, type),
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.status(201).json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    // Clean up all uploaded files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    next(error);
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:type/:filename
// @access  Private
export const deleteFile = async (req, res, next) => {
  try {
    const { type, filename } = req.params;

    // Validate type
    if (!['voice', 'images', 'files'].includes(type)) {
      throw new AppError('Invalid file type', 400);
    }

    const filePath = path.join(process.cwd(), 'uploads', type, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found', 404);
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};
