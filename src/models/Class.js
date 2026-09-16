import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ["JHS 1", "JHS 2", "JHS 3"],
    required: true,
  },
  section: {
    type: String,
  },
});

export default mongoose.models.Class || mongoose.model("Class", classSchema);
