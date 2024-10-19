const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const tripSchema = mongoose.Schema(
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
tripSchema.plugin(toJSON);
tripSchema.plugin(paginate);

/**
 * @typedef User
 */
const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
