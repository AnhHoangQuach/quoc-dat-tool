const express = require('express');
const auth = require('../../middlewares/auth');
const tripController = require('../../controllers/trip.controller');
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

router.route('/').get(auth(), tripController.getTrips);
router.route('/in-month').get(auth(), tripController.getTripsByFilter);
router.route('/dashboard').get(auth(), tripController.queryDashboard)
router.route('/import').post(auth('manageUsers'), upload.single('file'), tripController.importData);
router.route('/export').post(auth(), tripController.exportData);

module.exports = router;
