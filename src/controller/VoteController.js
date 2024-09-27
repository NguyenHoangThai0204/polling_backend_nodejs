const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const ContentPoll = require('../models/ContentPoll'); // Giả sử bạn có mô hình ContentPoll

exports.createVote = async (req, res) => {
    try {
        const vote = new Vote(req.body);
        await vote.save();
        console.log('Vote saved:', vote); // Log để kiểm tra vote đã được lưu

        // Tìm Poll chứa Option và cập nhật votes
        const updatedPoll = await ContentPoll.findOneAndUpdate(
            { "options._id": vote.optionId }, // Điều kiện tìm kiếm
            { $push: { "options.$.votes": vote._id } }, // Cập nhật votes trong options
            { new: true } // Tùy chọn: trả về tài liệu đã cập nhật
        );
        console.log('Updated Poll:', updatedPoll); // Log để kiểm tra poll đã được cập nhật

        if (!updatedPoll) {
            console.log('Option not found in Poll:', vote.optionId); // Log để kiểm tra option không tìm thấy
            return res.status(404).json({ 
                message: 'Option not found in Poll', 
                optionId: vote.optionId 
            });
        }
        res.status(200).json({
            status: 'OK',
            message: 'Create vote success',
            data: {
                vote: vote,
                updatedPoll: updatedPoll // Xuất updatedPoll cùng với phản hồi JSON
            }
        });
    } catch (error) {
        console.error('Error creating vote:', error);
        res.status(500).json({ message: 'Internal Server Error' + error });
    }
};