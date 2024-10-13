const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { historyService, tripService } = require('../services');
const ExcelJS = require('exceljs');

const importData = catchAsync(async (req, res) => {
  const filePath = req.file.path;

  // Create an instance of ExcelJS Workbook
  const workbook = new ExcelJS.Workbook();

  // Read the uploaded Excel file
  await workbook.xlsx.readFile(filePath);

  workbook.eachSheet((worksheet, sheetId) => {
    console.log(`Sheet ID: ${sheetId}, Name: ${worksheet.name}`);
  });

  // Assuming the data is in the first sheet
  const worksheetHistory = workbook.getWorksheet(5);

  // Iterate through each row of the worksheet (starting from row 2 to skip headers)
  const dataToSave = [];
  worksheetHistory.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const rowData = {
        timeOccurence: new Date(row.getCell(1).value).toISOString(),
        pathOne: row.getCell(2).value,
        pathSecond: row.getCell(3).value,
        pathThree: row.getCell(4).value,
        pathFour: row.getCell(5).value,
        pathFive: row.getCell(6).value,
        status: row.getCell(7).value,
        value: row.getCell(8).value,
        indicator: row.getCell(9).value,
      };

      dataToSave.push(rowData);
    }
  });

  await historyService.insertHistory(dataToSave);


  // Assuming the data is in the first sheet
  const worksheetTrip = workbook.getWorksheet(8);

  // Iterate through each row of the worksheet (starting from row 2 to skip headers)
  const tripToSave = [];
  worksheetTrip.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const rowData = {
        timeOccurence: new Date(row.getCell(1).value).toISOString(),
        pathOne: row.getCell(2).value,
        pathSecond: row.getCell(3).value,
        pathThree: row.getCell(4).value,
        pathFour: row.getCell(5).value,
        pathFive: row.getCell(6).value,
        status: row.getCell(7).value,
        value: row.getCell(8).value,
        indicator: row.getCell(9).value,
      };

      tripToSave.push(rowData);
    }
  });

  await tripService.insertTrip(tripToSave)

  res.status(httpStatus.CREATED).send({ message: 'Imported' });
});

const exportData = catchAsync(async (req, res) => {

});

module.exports = {
  importData,
  exportData
};
