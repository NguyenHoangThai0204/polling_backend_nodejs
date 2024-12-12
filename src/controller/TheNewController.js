const TheNew = require('../models/TheNew');
const { ObjectId } = require("mongodb");

let io;
const setSocket = (socketIo) => {
    io = socketIo;
};

const createTheNew = async (req, res) => {
    try {
       
        const {
            tenBaiViet,
            chuDeBaiViet,
            hinhAnhBaiViet,
            noiDungBaiViet,
            nguoiViet,
            thoiGianViet,
        } = req.body;
        const theNew = new TheNew({
            tenBaiViet,
            chuDeBaiViet,
            hinhAnhBaiViet,
            noiDungBaiViet,
            nguoiViet,
            thoiGianViet,
        });

        await theNew.save();
        res
        .status(200)
        .json({
            status:"Ok",
            message:"Create TheNew success",
            data: theNew
        });

    } catch (error) {
        console.error("Error creating TheNew:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
    }
};

const findAllTheNew = async (req, res) =>{
    try{
        const listNew = await TheNew.find()
        res 
         .status(200)
         .json({
            status:"Ok",
            message:"Success",
            data: listNew
         })
    }catch(error){
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const findAllTheNewById = async (req, res) => { 
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                status: "Err",
                message: "ID is required.",
            });
        }

        // Kiểm tra id có hợp lệ không
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "Err",
                message: "Invalid ID format.",
            });
        }


        // Tìm bản ghi
        const theNew = await TheNew.findById({ _id: id });

        if (!theNew) {
            return res.status(404).json({
                status: "Err",
                message: "The new not found.",
            });
        }

        res.status(200).json({
            status: "OK",
            message: "Success",
            data: theNew,
        });
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).json({
            status: "Err",
            message: "Internal Server Error",
        });
    }
};

const deleteTheNew = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "Err",
                message: "Invalid ID format.",
            });
        }

        const result = await TheNew.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({
                status: "Err",
                message: "The new not found.",
            });
        }

        res.status(200).json({
            status: "OK",
            message: "Successfully deleted.",
        });
        if (io) {
            io.emit("deleteThenew", { id: id });
            console.log("Đã gửi tín hiệu socket xóa poll");
        } else {
            console.log("io is null");
        }


    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({
            status: "Err",
            message: "Internal Server Error",
        });
    }
};

const updateTheNew = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem ID có hợp lệ không
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "Err",
                message: "Invalid ID format.",
            });
        }

        // Lấy dữ liệu từ body
        const {
            tenBaiViet,
            chuDeBaiViet,
            hinhAnhBaiViet,
            noiDungBaiViet,
            nguoiViet,
            thoiGianViet,
        } = req.body;

        // Tìm và cập nhật bản ghi
        const updatedTheNew = await TheNew.findByIdAndUpdate(
            id,
            {
                $set: {
                    tenBaiViet,
                    chuDeBaiViet,
                    hinhAnhBaiViet,
                    noiDungBaiViet,
                    nguoiViet,
                    thoiGianViet,
                },
            },
            { new: true, runValidators: true } // `new: true` trả về dữ liệu đã cập nhật, `runValidators` kiểm tra dữ liệu hợp lệ
        );

        // Kiểm tra nếu không tìm thấy bản ghi
        if (!updatedTheNew) {
            return res.status(404).json({
                status: "Err",
                message: "The new not found.",
            });
        }

        res.status(200).json({
            status: "OK",
            message: "Successfully updated.",
            data: updatedTheNew,
        });

        // Phát tín hiệu qua socket nếu cần
        if (io) {
            io.emit("updateThenew", { id, updatedTheNew });
            console.log("Đã gửi tín hiệu socket cập nhật bài viết");
        } else {
            console.log("io is null");
        }
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).json({
            status: "Err",
            message: "Internal Server Error",
        });
    }
};

module.exports = {
 createTheNew,
 findAllTheNew,
 findAllTheNewById,
 deleteTheNew,setSocket,
    updateTheNew,
};