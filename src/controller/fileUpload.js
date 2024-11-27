require('dotenv').config();
const multer = require('multer');
const path = require('path');
const util = require('util');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');


const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});


const storage = multerS3({
    s3: s3,
    bucket:process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|mp4|avi|mov|mkv|wmv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: File Only (jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx)!');
    }
}

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 1000000 },
});

const uploadFileMiddleware = upload;

module.exports = uploadFileMiddleware;
