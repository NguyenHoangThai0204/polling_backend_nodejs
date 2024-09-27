const ContentPoll = require("../models/ContentPoll")

exports.createPolling = async( req, res )=>{
    try {
        const poll = new ContentPoll(req.body);
        await poll.save();
        res.status(200).json({
            status: "OK",
            message:"Create Polling success",
            data: poll
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" + error});
    }
}

exports.findAllPollingUser = async( req, res )=>{
    try {
        const authorId = req.params.authorId;
        const listPolling = await ContentPoll.find({authorId: authorId});
        res.status(200).json({
            status: "OK",
            message: "Success",
            data: listPolling
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" + error});
    }
}

exports.findAllPolling = async( req, res )=>{
    try {
        const listPolling = await ContentPoll.find();
        res.status(200).json({
            status: "OK",
            message: "Success",
            data: listPolling
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" + error});
    }
}

exports.findByIdPolling = async (req, res) => {
    try {
        const id = req.params.id;  // Lấy giá trị id từ params
        const Polling = await ContentPoll.findById(id);
        res.status(200).json({
            status: "OK",
            message: "Success",
            data: Polling
        });
    } catch (error) {
        console.error("Error finding polling:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
    }
};

