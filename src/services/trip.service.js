const { Trip } = require('../models');

const insertTrip = async (data) => {
  return Trip.insertMany(data);
};

const queryTrips = async (filter, options) => {
  const query = {};

  if (filter?.from || filter?.to) {
    query.timeOccurence = {};
    if (filter.from) {
      query.timeOccurence.$gte = new Date(filter.from);
    }
    if (filter.to) {
      query.timeOccurence.$lte = new Date(filter.to);
    }
  }

  const result = await Trip.find(query).setOptions(options);
  return result;
};

module.exports = {
  insertTrip,
  queryTrips,
};
