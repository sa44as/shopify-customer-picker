import {Schema, model} from "mongoose";

const originSchema = new Schema(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const originModel = model("origin", originSchema);

export { originModel }
