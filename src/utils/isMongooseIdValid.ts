import mongoose from "mongoose";

export const isMongoDbIdValidFunc = (id: string): boolean => { 
  return mongoose.Types.ObjectId.isValid(id)
}