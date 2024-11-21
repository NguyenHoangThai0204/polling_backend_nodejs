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
router.post("/create_the_new", theNewController.createTheNew);

// Get: http://localhost:3000/api/theNew/find_all_the_new
router.get("/find_all_the_new", theNewController.findAllTheNew);

// Get: http://localhost:3000/api/theNew/find_the_new_by_id/673c6a191a95c26aec6ae0d7
router.get("/find_the_new_by_id/:id", theNewController.findAllTheNewById);

// Post http://localhost:3000/api/theNew/delete_the_new
router.post("/delete_the_new/:id",theNewController.deleteTheNew);


module.exports = router;