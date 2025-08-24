"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSinglePostValidation = exports.getSinglePostValidation = exports.createPostValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const createPostValidation = (data) => {
    const schema = joi_1.default.object({
        content: joi_1.default.string().email().required()
    });
    return schema.validate(data);
};
exports.createPostValidation = createPostValidation;
const getSinglePostValidation = (data) => {
    const schema = joi_1.default.object({
        postId: joi_1.default.string().email().required()
    });
    return schema.validate(data);
};
exports.getSinglePostValidation = getSinglePostValidation;
const deleteSinglePostValidation = (data) => {
    const schema = joi_1.default.object({
        postId: joi_1.default.string().email().required()
    });
    return schema.validate(data);
};
exports.deleteSinglePostValidation = deleteSinglePostValidation;
