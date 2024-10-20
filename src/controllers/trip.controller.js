const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tripService } = require('../services');
const ExcelJS = require('exceljs');
const pick = require('../utils/pick');

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
  const worksheetHistory = workbook.getWorksheet(9);

  // Iterate through each row of the worksheet (starting from row 2 to skip headers)
  const dataToSave = [];
  worksheetHistory.eachRow(async (row, rowNumber) => {
    if (rowNumber > 1 && ['Open'].includes(row.getCell(7).value)) {
      const rowData = {
        timeOccurence: new Date(row.getCell(1).value).toISOString(),
        pathOne: row.getCell(2).value,
        pathSecond: row.getCell(3).value,
        pathThree: row.getCell(4).value,
        pathFour: row.getCell(5).value,
        pathFive: row.getCell(6).value,
        value: row.getCell(7).value,
        indicator: row.getCell(8).value,
        status: row.getCell(11).value,
      };

      dataToSave.push(rowData);
    }
  });

  // Assuming the data is in the first sheet
  const worksheetTrip = workbook.getWorksheet(8);

  // Iterate through each row of the worksheet (starting from row 2 to skip headers)
  const tripToSave = [];
  worksheetTrip.eachRow(async (row, rowNumber) => {
    if (rowNumber > 1 && ['Trip', 'Operated'].includes(row.getCell(8).value) && row.getCell(2).value.startsWith('DMZ')) {
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

  let results = [];
  for (const trip of tripToSave) {
    results.push({
      ...trip,
      isChecked: !dataToSave.some(
        (item) =>
          item.timeOccurence === trip.timeOccurence && item.pathOne === trip.pathOne && item.pathSecond === trip.pathSecond,
      ),
    });
  }

  if (results.length > 0) results = await tripService.insertTrip(results);
  return res.status(httpStatus.CREATED).send(results);
});

const exportData = catchAsync(async (req, res) => {
  const filter = pick(req.body, ['from', 'to']);
  const trips = await tripService.queryTrips(filter);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=thong_ke_su_co.xlsx');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('thong_ke_su_co');

  worksheet.mergeCells('A1:D1');

  // Insert dynamic header text into the merged cell
  const headerCell = worksheet.getCell('A1');
  headerCell.value = 'Số sự cố DMZ ngày 17/09/2024'; // Dynamic header text, adjust as needed
  headerCell.font = { bold: true }; // Add formatting like bold and size
  headerCell.alignment = { horizontal: 'center' }; // Center-align the text horizontally

  worksheet.getRow(2).values = ['Thời gian', 'Địa điểm', 'Vị trí', 'Cần kiểm tra'];
  worksheet.getRow(2).font = { bold: true };

  let rowStart = 3;
  trips.forEach((item) => {
    const row = worksheet.getRow(rowStart);
    row.getCell(1).value = item.timeOccurence;
    row.getCell(2).value = item.pathOne;
    row.getCell(3).value = item.pathSecond;
    row.getCell(4).value = item.isCheck ? 'Có' : 'Không';
    row.commit();
    rowStart++;
  });

  // Write the Excel file to the response stream
  await workbook.xlsx.write(res);

  // End the response
  res.end();
});

module.exports = {
  importData,
  exportData,
};
