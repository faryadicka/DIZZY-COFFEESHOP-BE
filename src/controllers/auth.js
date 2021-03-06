const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const generator = require("generate-password");
const {
  registerUserModel,
  loginUserModel,
  getPasswordForCompare,
  resetPasswordModel,
  verifyEmailModel,
} = require("../models/auth");
const { sendPasswordConfirmation } = require("../config/nodemailer");
const { onFailed, onSuccess } = require("../helpers/response");
var confirmOTP = Math.random();
confirmOTP = confirmOTP * 1000000;
confirmOTP = parseInt(confirmOTP);

const registerUserControl = async (req, res) => {
  try {
    const result = await registerUserModel(req.body);
    const { data, message, status } = result;
    onSuccess(res, status, message, data);
  } catch (error) {
    const { message, status, err } = error;
    onFailed(res, status, message, err);
  }
};

const loginUserControl = async (req, res) => {
  try {
    const result = await loginUserModel(req.body);
    const { data, message, status } = result;
    onSuccess(res, status, message, data);
  } catch (error) {
    const { message, status, err } = error;
    onFailed(res, status, message, err);
  }
};

const loginAuthControl = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await getPasswordForCompare(email);
    const result = await bcrypt.compare(password, data.password);
    if (!result) {
      return onFailed(res, 400, "Email or password is wrong!");
    }
    const payload = {
      id: data.id,
      email,
      role: data.role_id,
      name: data.display_name ? data.display_name : "Dear customer",
    };
    const jwtOption = {
      expiresIn: "100000000000s",
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, jwtOption);
    onSuccess(res, 200, "Login Success!", {
      email,
      token,
      role: data.role_id,
    });
  } catch (error) {
    console.log(error, "err");
    const { message, status, err } = error;
    onFailed(res, status, message, err);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // const confirmCode = generator.generate({
    //   length: 7,
    //   numbers: true,
    // });
    await sendPasswordConfirmation(email, email, confirmOTP);
    onSuccess(res, 200, "Please check your email for password confirmation");
  } catch (error) {
    const { message, status } = error;
    onFailed(res, status ? status : 500, message, error);
  }
};

const resetPasswordControl = async (req, res) => {
  try {
    const { newPassword, otp, email } = req.body;
    console.log("ConfirmOtp :", confirmOTP);
    console.log("otp :", Number(otp));
    if (Number(otp) !== confirmOTP)
      return onFailed(res, 401, "OTP code invalid!", "NOT MATCH");
    const result = await resetPasswordModel(newPassword, Number(otp), email);
    const { message, status, data } = result;
    onSuccess(res, status, message, data);
  } catch (error) {
    const { message, status, err } = error;
    onFailed(res, status, message, err);
  }
};

const verifyEmailControl = async (req, res) => {
  try {
    const { email } = req.userInfo;
    const result = verifyEmailModel(email);
    const { message, status, data } = result;
    onSuccess(res, status, message, data);
  } catch (error) {
    const { message, status, err } = error;
    onFailed(res, status, message, err);
  }
};

module.exports = {
  registerUserControl,
  loginUserControl,
  loginAuthControl,
  forgotPassword,
  resetPasswordControl,
  verifyEmailControl,
};
