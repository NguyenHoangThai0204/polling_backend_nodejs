const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
    tenBaiViet: {
        type: String,
        required: true,
    },
    chuDeBaiViet: {
        type: String,
    },
    hinhAnhBaiViet: {
        type: String,
    },
    noiDungBaiViet: {
        type: String,
    },
    nguoiViet: {
        type: String,
    },
    thoiGianViet: {
        type: Date,
        default: Date.now,
    },
});

const TheNew = mongoose.model("TheNew", optionSchema);
module.exports = TheNew;
