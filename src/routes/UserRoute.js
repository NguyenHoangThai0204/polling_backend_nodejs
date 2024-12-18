const express = require("express");
const router = express.Router(); // Sử dụng router của express
const userController = require("../controller/UserController");
const { passwordResetVerificationValidator } = require("../helpers/Validations");

// Post: http://localhost:3000/api/user/resetPassword
router.put("/resetPassword", userController.resetPasswordByEmail);

// Post: http://localhost:3000/api/user/updateUser
router.put("/update_user", userController.updateUser);

// Post: http://localhost:3000/api/user/signUpGmail
router.post("/signUpGmail", userController.signUpWithGmail);

// Post: http://localhost:3000/api/user/forgotPassword
router.post("/forgotPassword", passwordResetVerificationValidator, userController.forgotPassword);

// Post: http://localhost:3000/api/user/verifyOTP
router.post("/verifyOTP", userController.verifyOTP);

// Post: http://localhost:3000/api/user/signup
// {"email":"xinchao","password":"xinhaha", "fullName":"Nguyễn Hoàng Thái"}
router.post("/signup", userController.createUser);

// Get: http://localhost:3000/api/user/findAllUser
router.get("/find_all_user", userController.findAllUser);

// Post: http://localhost:3000/api/user/login
// {"email":"xinchao","password":"xinhaha"}
router.post("/login", userController.loginUser);

// Get: http://localhost:3000/api/user/getUserByid/
router.get("/get_user_byid", userController.findByIdUser);

// Get: http://localhost:3000/api/user/getUserByid/
router.post("/find_by_id_user", userController.findByIdUser);

// Post: http://localhost:3000/api/user/updateUser
// {
//     "id":"66cbc96d367aa89344e6c0d9"
// }
router.post("/deleted_user", userController.updateUserStatusToNon);

// Post: http://localhost:3000/api/user/updateUser
router.post("/undeleteUser", userController.updateUserStatusToActive);

// logout 
router.post("/logout", userController.logoutUser);

router.post("/add_pollid_to_listvote", userController.addPollIdInListVoteOfUser);

module.exports = router;
