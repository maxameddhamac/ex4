import mongoose, { Schema } from "mongoose";

export type Priority = "low" | "medium" | "high";

export type TodoRecord = {
  _id: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
};

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true },
);

export const Todo =
  (mongoose.models.Todo as mongoose.Model<TodoRecord> | undefined) ??
  mongoose.model<TodoRecord>("Todo", todoSchema);
