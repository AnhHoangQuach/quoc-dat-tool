const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // Config Cloudinary

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars', // Thư mục trong Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Định dạng cho phép
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
