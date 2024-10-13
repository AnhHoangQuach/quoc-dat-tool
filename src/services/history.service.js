const { History } = require('../models');

const insertHistory = async (data) => {
  return History.insertMany(data);
};

module.exports = {
  insertHistory,
};
