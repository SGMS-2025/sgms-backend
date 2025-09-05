const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const logger = require('../config/logger');
const { createAppError } = require('../common/error');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Thư mục lưu trữ ảnh đại diện trên Cloudinary
const avatarFolder = process.env.CLOUDINARY_FOLDER || 'sgms_avatars';

/**
 * Cấu hình lưu trữ Cloudinary cho Multer
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: avatarFolder,
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' },
    ],
    format: 'jpg',
  },
});

/**
 * Bộ lọc tệp tin để chỉ chấp nhận hình ảnh
 * @param {Object} req - Express request object
 * @param {Object} file - File upload object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận các định dạng hình ảnh
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createAppError.badRequest('Unsupported file type. Only JPG, JPEG, PNG and GIF are allowed.'), false);
  }
};

/**
 * Cấu hình multer cho upload avatar
 */
const avatarUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter: fileFilter,
});

/**
 * Upload một tệp hình ảnh lên Cloudinary
 * @param {String} imagePath - Đường dẫn đến tệp hình ảnh
 * @returns {Promise} - Promise với kết quả upload
 */
const uploadImage = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: avatarFolder,
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
      ],
    });
    
    return {
      publicId: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    logger.error(`Error uploading image to Cloudinary: ${error.message}`);
    throw createAppError.internalServerError('Failed to upload image');
  }
};

/**
 * Xóa một hình ảnh từ Cloudinary
 * @param {String} publicId - Public ID của hình ảnh trên Cloudinary
 * @returns {Promise} - Promise với kết quả xóa
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Error deleting image from Cloudinary: ${error.message}`);
    // Không throw error khi xóa ảnh, chỉ log ra lỗi
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  avatarUpload: avatarUpload.single('avatar'), // Middleware cho single avatar upload
  avatarUploadMultiple: avatarUpload.array('avatars', 5), // Middleware cho multiple avatar upload (tối đa 5)
};
