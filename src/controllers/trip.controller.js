const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tripService } = require('../services');
const ExcelJS = require('exceljs');
const pick = require('../utils/pick');
const moment = require('moment');

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

      const isDuplicate = tripToSave.some((trip) => {
        const timeDifference = Math.abs(new Date(trip.timeOccurence).getTime() - new Date(rowData.timeOccurence).getTime());
        return (
          (timeDifference <= 120000 || timeDifference === 0) &&
          trip.pathOne === rowData.pathOne &&
          trip.pathSecond === rowData.pathSecond
        );
      });

      if (!isDuplicate) {
        tripToSave.push(rowData);
      }
    }
  });

  const existingTrips = await tripService.getTripsByFilter();

  let results = [];
  for (const trip of tripToSave) {
    const isDuplicate = existingTrips.some(
      (existingTrip) =>
        new Date(existingTrip.timeOccurence).getTime() === new Date(trip.timeOccurence).getTime() &&
        existingTrip.pathOne === trip.pathOne &&
        existingTrip.pathSecond === trip.pathSecond,
    );

    if (!isDuplicate) {
      results.push({
        ...trip,
        isChecked: !dataToSave.some(
          (item) =>
            item.timeOccurence === trip.timeOccurence &&
            item.pathOne === trip.pathOne &&
            item.pathSecond === trip.pathSecond,
        ),
      });
    }
  }

  if (results.length > 0) results = await tripService.insertTrip(results);
  return res.status(httpStatus.CREATED).send(true);
});

const exportData = catchAsync(async (req, res) => {
  const filter = pick(req.body, ['from', 'to', 'search']);
  const trips = await tripService.getTripsByFilter(filter);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=thong_ke_su_co.xlsx');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('thong_ke_su_co');

  worksheet.mergeCells('A1:D1');

  // Insert dynamic header text into the merged cell
  const headerCell = worksheet.getCell('A1');
  headerCell.value = 'Thống kê sự cố';
  headerCell.font = { bold: true };
  headerCell.alignment = { horizontal: 'center' }; // Center-align the text horizontally

  worksheet.getRow(2).values = ['Thời gian', 'Địa điểm', 'Vị trí', 'Cần kiểm tra'];
  worksheet.getRow(2).font = { bold: true };

  let rowStart = 3;
  trips.forEach((item) => {
    const row = worksheet.getRow(rowStart);
    row.getCell(1).value = moment(item.timeOccurence).format('DD/MM/YYYY HH:mm:ss');
    row.getCell(2).value = item.pathOne;
    row.getCell(3).value = item.pathSecond;
    row.getCell(4).value = item.isChecked ? 'Có' : 'Không';
    row.commit();
    rowStart++;
  });

  // Write the Excel file to the response stream
  await workbook.xlsx.write(res);

  // End the response
  res.end();
});

const getTrips = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['from', 'to', 'search']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await tripService.queryTrips(filter, options);
  res.send(result);
});

const queryDashboard = catchAsync(async (req, res) => {
  const result = await tripService.queryDashboard()
  res.send(result)
});

const getTripsByFilter = catchAsync(async (req, res) => {
  const result = await tripService.getTripsByFilter()
  res.send(result)
});

module.exports = {
  importData,
  exportData,
  getTrips,
  queryDashboard,
  getTripsByFilter
};
