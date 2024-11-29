const {check} = require('express-validator');

exports.passwordResetVerificationValidator = [
    check('email', 'Email không hợp lệ').isEmail().normalizeEmail({
        gmail_remove_dots: false,
    }),
] ;