const cloudinary = require('../config/cloudinary');

/**
 * Upload image to Cloudinary
 */
const uploadImage = async (buffer, folder = 'nagarsetu/issues') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Delete multiple images from Cloudinary
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds.length) return true;
    await cloudinary.api.delete_resources(publicIds);
    return true;
  } catch (error) {
    console.error('Error deleting images:', error);
    return false;
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  deleteMultipleImages,
};
