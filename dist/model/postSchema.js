"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        unique: true
    },
    imageId: [{
            type: String,
            required: true,
        }],
    createdAt: {
        type: Date,
        Default: Date.now()
    }
}, {
    timestamps: true
});
// enables us to filter the entire datbase based on a given content
postSchema.index({
    content: "text"
});
const postModel = mongoose_1.default.model("post", postSchema);
exports.default = postModel;
