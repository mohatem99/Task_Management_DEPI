import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ATLAS_URI);

    console.log("Database connection established");
  } catch (err) {
    console.log("failed to connect to db", err);
    process.exit(1);
  }
};

export default dbConnection;
