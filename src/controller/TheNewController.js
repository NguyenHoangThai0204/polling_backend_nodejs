const TheNew = require('../models/TheNew');

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

const findAllTheNewById = async (req, res)=>{
    try{
        const id  = req.params.id;

    if ( !id ) {
        return res.status(400).json({
            status: "Err",
            message: "ID is required.",
        });
    }

    const theNew = await TheNew.findById(id);

    if( !theNew ) {
        return res.status(400).json({
            status:"error",
            message:" The new not found",
        });
    }
    res.status(200).json({
        status: "OK",
        message: "Success",
        data: theNew,
      });


    }catch( error){
        console.error("Error finding user:", error);
        res.status(500).json({ message: "Internal Server Error" 
        });
    }
};

module.exports = {
 createTheNew,
 findAllTheNew,
 findAllTheNewById,
};