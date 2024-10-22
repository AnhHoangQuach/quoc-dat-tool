const { Trip } = require('../models');

const insertTrip = async (data) => {
  return Trip.insertMany(data);
};

const getTripsByFilter = async (filter, options) => {
  const query = {};

  if (filter?.from || filter?.to) {
    query.timeOccurence = {};
    if (filter.from) {
      query.timeOccurence.$gte = new Date(filter.from);
    }
    if (filter.to) {
      const endOfDay = new Date(filter.to);
      endOfDay.setHours(23, 59, 59);
      query.timeOccurence.$lte = endOfDay;
    }
  }

  if (filter?.search) {
    query.pathOne = { $regex: filter.search, $options: 'i' };
  }

  const result = await Trip.find(query).setOptions(options);
  return result;
};

const queryTrips = async (filter, options) => {
  if (filter?.from || filter?.to) {
    // Ensure 'timeOccurence' field is initialized in the filter object
    filter.timeOccurence = filter.timeOccurence || {};

    if (filter.from) {
      // Add '$gte' condition for 'from' date
      filter.timeOccurence.$gte = new Date(filter.from);
      delete filter.from; // Remove 'from' after using it
    }

    if (filter.to) {
      // Add '$lte' condition for 'to' date
      const endOfDay = new Date(filter.to);
      endOfDay.setHours(23, 59, 59);
      filter.timeOccurence.$lte = endOfDay;
      delete filter.to; // Remove 'to' after using it
    }
  }

  if (filter?.search) {
    filter.pathOne = { $regex: filter.search, $options: 'i' };
    delete filter.search; // Remove 'search' after applying it to the query
  }

  const trips = await Trip.paginate(filter, options);
  return trips;
};

const queryDashboard = async () => {
  const trips = await Trip.aggregate([
    {
      $match: { pathSecond: { $exists: true, $ne: null } }  // Filter out documents where pathOne does not exist or is null
    },
    {
      $group: {
        _id: "$pathSecond",
        pathOne: { $first: "$pathOne" },
        count: { $sum: 1 },  // Count the occurrences
      }
    },
    {
      $sort: { count: -1 }  // Sort by count in descending order
    },
    {
      $limit: 10  // Limit the result to top 10
    },
    {
      $project: {
        _id: 0,  // Remove the _id field
        pathSecond: "$_id",
        pathOne: 1, // Move the _id (which is pathOne) to the pathOne field
        count: 1,  // Include the count of occurrences
      }
    }
  ]);
  return trips;
};

module.exports = {
  insertTrip,
  queryTrips,
  getTripsByFilter,
  queryDashboard,
};
