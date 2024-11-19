const express = require("express");
const router = express.Router(); // Sử dụng router của express
const theNewController = require("../controller/TheNewController");

// Post: http://localhost:3000/api/theNew/createTheNew
// {
//     "tenBaiViet":"React js sự lựa chọn, lần đầu tiên tiếp cận ta nên làm gì",
//     "chuDeBaiViet":"Công nghệ",
//     "hinhAnhBaiViet":"https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474113Xbi/anh-dep-ve-ky-quan-thien-nhien-the-gioi_014851434.jpg",
//     "noiDungBaiViet":"Cuộc sống bận rộn",
//     "nguoiViet":"Admin"
// }
router.post("/createTheNew", theNewController.createTheNew);

// Get: http://localhost:3000/api/theNew/findAllTheNew
router.get("/findAllTheNew", theNewController.findAllTheNew);

// Get: http://localhost:3000/api/theNew/findAllTheNewById
router.get("/findAllTheNewById/:id", theNewController.findAllTheNewById);

module.exports = router;