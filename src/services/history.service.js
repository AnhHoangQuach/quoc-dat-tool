const { History } = require('../models');

const insertHistory = async (data) => {
  return History.insertMany(data);
};

const queryHistories = async (filter, options) => {
  const result = await History.find(filter, options);
  return result;
};


module.exports = {
  insertHistory,
  queryHistories,
};
