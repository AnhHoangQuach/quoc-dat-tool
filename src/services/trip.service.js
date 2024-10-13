const { Trip } = require('../models');

const insertTrip = async (data) => {
  return Trip.insertMany(data);
};

module.exports = {
  insertTrip,
};
