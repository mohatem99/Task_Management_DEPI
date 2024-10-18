import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Hide the password in the response
    },

    name: {
      type: String,
      required: true,
    },

    otp: String,
    passwordChangedAt: Date,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    customId: String,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    image: {
      public_id: String,
      secure_url: String,
    },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = model("User", userSchema);

export default User;
