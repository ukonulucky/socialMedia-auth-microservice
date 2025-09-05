import Joi from "joi";
import { createPostType, CustomePaymentReq } from "../types";

export const createPostValidation = (data: createPostType) => {
  const schema = Joi.object({
    content: Joi.string().required(),
  });
  return schema.validate(data);
};
export const getSinglePostValidation = (data: createPostType) => {
  const schema = Joi.object({
    postId: Joi.string().email().required(),
  });
  return schema.validate(data);
};

export const deleteSinglePostValidation = (data: createPostType) => {
  const schema = Joi.object({
    postId: Joi.string().email().required(),
  });
  return schema.validate(data);
};

export const createPaymentIntentValidation = (data: CustomePaymentReq) => {
    if (!data) {
      return {
        error: { details: [{ message: "Request body cannot be empty" }] }
      };
    }
  
  const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    amount: Joi.string().required(),
    groupId: Joi.string().required(),
    userId: Joi.string().email().required(),
  });
  return schema.validate(data);
};
