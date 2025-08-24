"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSinglePostController = exports.getSinglePostController = exports.getAllPostController = exports.createPostController = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const validate_1 = require("../utils/validate");
const postSchema_1 = __importDefault(require("../model/postSchema"));
// create post
const createPostController = async (req, res) => {
    logger_1.default.info("user hit the create post controller");
    try {
        // validate user input
        const { error } = (0, validate_1.createPostValidation)(req.body);
        if (error) {
            logger_1.default.error("create post error", error.details[0].message);
            res.status(400).json({
                message: error.details[0].message,
                status: false
            });
            return;
        }
        const { content, imageId } = req.body;
        const newPost = new postSchema_1.default({
            userId: req.userId,
            content,
            imageId: imageId || []
        });
        await newPost.save();
        logger_1.default.info("post created");
        res.status(201).json({
            message: "Post created successfuly",
            status: true,
            newPost
        });
    }
    catch (error) {
        logger_1.default.error("Post creation error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false
        });
    }
};
exports.createPostController = createPostController;
// get all post
const getAllPostController = async (req, res) => {
    logger_1.default.info("user hit the get all post controller");
    try {
        // get all post
        const posts = await postSchema_1.default.find({});
        res.status(201).json({
            message: "Posts fetched successfuly",
            status: true,
            data: {
                posts
            }
        });
    }
    catch (error) {
        logger_1.default.error("get all post error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false
        });
    }
};
exports.getAllPostController = getAllPostController;
// get single post
const getSinglePostController = async (req, res) => {
    logger_1.default.info("user hit the get single post controller");
    try {
        // validate user input
        const { error } = (0, validate_1.getSinglePostValidation)(req.body);
        if (error) {
            logger_1.default.error("get single post error", error.details[0].message);
            res.status(400).json({
                message: error.details[0].message,
                status: false
            });
            return;
        }
        const { postId } = req.body;
        // get present 
        const post = await postSchema_1.default.findById(postId);
        logger_1.default.info("single post obtained");
        res.status(201).json({
            message: "Single post fetched successfull",
            status: true,
            data: {
                post
            }
        });
    }
    catch (error) {
        logger_1.default.error("get single post error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false
        });
    }
};
exports.getSinglePostController = getSinglePostController;
const deleteSinglePostController = async (req, res) => {
    logger_1.default.info("user hit the delete controller");
    try {
        // validate user input
        const { error } = (0, validate_1.deleteSinglePostValidation)(req.body);
        if (error) {
            logger_1.default.error("delete single post error", error.details[0].message);
            res.status(400).json({
                message: error.details[0].message,
                status: false
            });
            return;
        }
        const { postId } = req.body;
        const post = await postSchema_1.default.findByIdAndDelete(postId);
        res.status(201).json({
            message: "Post deleted successfully",
            status: true,
            data: {
                post
            }
        });
    }
    catch (error) {
        logger_1.default.error("Post deletion error", error);
        res.status(500).json({
            message: "Internal server error",
            status: false
        });
    }
};
exports.deleteSinglePostController = deleteSinglePostController;
