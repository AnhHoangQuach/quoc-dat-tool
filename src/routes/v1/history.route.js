const express = require('express');
const auth = require('../../middlewares/auth');
const historyController = require('../../controllers/history.controller');
const multer = require('multer');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

const router = express.Router();

router.route('/import').post(auth('manageUsers'), upload.single('file'), historyController.importData);
router.route('/export').post(auth('manageUsers'), historyController.exportData);

module.exports = router;
