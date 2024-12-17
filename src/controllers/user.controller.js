const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { User } = require('../models');
const { updateAvatar } = require('../services/user.service');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  console.log('Request params:', req.params.userId); // Log ID user được gửi đến backend

  const deletedUser = await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.OK).json({
    message: 'User deleted successfully',
    data: deletedUser,
  });
});

const uploadAvatar = catchAsync(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }
    // Đường dẫn avatar từ file upload
    let avatarUrl = req.file.path;

    // Cập nhật avatar trong database thông qua service
    const updatedUser = await updateAvatar(userId, avatarUrl);

    // Gửi response
    res.status(200).send({
      message: 'Avatar uploaded successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).send({ message: 'Failed to upload avatar' });
  }
});


module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar
};
