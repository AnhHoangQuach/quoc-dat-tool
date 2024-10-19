const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const historySchema = mongoose.Schema(
  {
    timeOccurence: {
      type: Date,
      required: true,
    },
    pathOne: {
      type: String,
    },
    pathSecond: {
      type: String,
    },
    pathThree: {
      type: String,
    },
    pathFour: {
      type: String,
    },
    pathFive: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
    indicator: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
historySchema.plugin(toJSON);
historySchema.plugin(paginate);

/**
 * @typedef User
 */
const History = mongoose.model('History', historySchema);

module.exports = History;
