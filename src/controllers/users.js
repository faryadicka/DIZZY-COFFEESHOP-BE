const {
  // insertUserModel,
  getAllUsersModel,
  getDetailUserModel,
  updateUserModel,
  resetPasswordModel,
  updatePasswordModel,
} = require("../models/users");
const { onSuccess, onFailed, pagination } = require("../helpers/response");

const getAllUsersControl = (req, res) => {
  const { query } = req;
  getAllUsersModel(query)
    .then(
      ({ data, limit, message, status, totalData, totalPage, currentPage }) => {
        pagination(res, req, {
          query,
          data,
          totalData,
          totalPage,
          currentPage,
          limit,
          message,
          status,
        });
      }
    )
    .catch(({ message, status, err }) => {
      onFailed(res, status, message, err);
    });
};

const getDetailUserControl = (req, res) => {
  const { id } = req.userInfo;
  getDetailUserModel(id)
    .then(({ message, status, data }) => {
      onSuccess(res, status, message, data);
    })
    .catch(({ message, status, err }) => {
      onFailed(res, status, message, err);
    });
};

const updateUserControl = (req, res) => {
  const { id } = req.userInfo;
  updateUserModel(req.body, id, req.file)
    .then(({ message, status, data }) => {
      onSuccess(res, status, message, data);
    })
    .catch(({ message, status, err }) => {
      onFailed(res, status, message, err);
    });
};

const resetPasswordController = (req, res) => {
  resetPasswordModel(req.body)
    .then(({ message, status, data }) => {
      onSuccess(res, status, message, data);
    })
    .catch(({ message, status, err }) => {
      onFailed(res, status, message, err);
    });
};

const updatePasswordControl = async (req, res) => {
  try {
    const { id } = req.userInfo;
    const { newPassword } = req.body;
    const result = await updatePasswordModel(newPassword, id);
    const { message, status, data } = result;
    onSuccess(res, status, message, data);
  } catch (error) {
    const { message, status, err } = error;
    onFailed(res, status, message, err);
  }
};

module.exports = {
  getAllUsersControl,
  getDetailUserControl,
  updateUserControl,
  resetPasswordController,
  updatePasswordControl,
};
