const express = require("express");
const router = express.Router(); // Sử dụng router của express
const ssoController = require("../controller/SSOController");

// Post: http://localhost:3000/api/auth/google
router.post("/google", ssoController.googleLogin);



module.exports = router;