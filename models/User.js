const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, min: 3, max: 20, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, max: 50, unique: true },
    gender: { type: String, required: true },
    birthday: { type: Date, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true, min: 8 },
    profilePicture: { type: String, default: "https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=170667a&w=0&h=kEAA35Eaz8k8A3qAGkuY8OZxpfvn9653gDjQwDHZGPE=" },
    coverPicture: { type: String, default: "" },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    isAdmin: { type: Boolean, default: false },
    description: { type: String, max: 50 },
    city: { type: String, max: 50 },
    from: { type: String, max: 50 },
    relationship: { type: String, default: "Solter@" },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);