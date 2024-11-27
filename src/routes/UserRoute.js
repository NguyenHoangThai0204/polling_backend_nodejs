const express = require("express");
const router = express.Router(); // Sử dụng router của express
const userController = require("../controller/UserController");

// Post: http://localhost:3000/api/user/signUpGmail
router.post("/signUpGmail", userController.signUpWithGmail);

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

module.exports = router;
