import { Schema, model } from "mongoose";
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  },
  { timestamps: true }
);
const Category = model("Category", categorySchema);
export default Category;
