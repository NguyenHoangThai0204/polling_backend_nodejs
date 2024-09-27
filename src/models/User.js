const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
  },
  avatar: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: Date,
    default: new Date("2000-01-01"),
  },
  gender: {
    type: Boolean,
    default: false,
  },
  listVote:{
    type:[{id_vote:String}],
    default:[]
  },
  role: {
    type: String,
    default: "user",
  },
  status: {
    type: String,
    default: "active",
  },
  province: {
    type: String,
  },
  district: {
    type: String,
  },
  ward: {
    type: String,
  },
  street: {
    type: String,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User; // Sửa lỗi ở đây
