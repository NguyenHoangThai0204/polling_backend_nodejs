const express = require('express');
const router = express.Router();
const uploadFileMiddleware = require('../controller/fileUpload');

// Controller xử lý kết quả upload
const uploadHandler = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            status: 'Err', 
            message: 'No file uploaded' 
        });
    }

    const fileUrl = req.file.location; // URL file trên S3 do `multer-s3` cung cấp
    res.status(200).json({
        status: 'OK',
        message: 'File uploaded successfully',
        fileUrl: fileUrl,
    });
};

// Route upload Content-Type: multipart/form-data, Body form-data. Key: file
// POST: http://localhost:3000/api/upload
router.post('/uploadFile', uploadFileMiddleware.single('file'), uploadHandler);

module.exports = router;
