import mongoose, { Schema, models } from "mongoose";

const questionPaperSchema = new Schema(
  {
    // Core Information
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    
    // Multiple Download / Resource Links (Replaces directUrl)
    links: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true }
      }
    ],

    // Media
    coverImageUrl: { type: String, default: "" },

    // SEO & Discovery
    focusKeywords: { type: String, default: "" },
    metaDescription: { type: String, default: "" },

    // Content
    fullDetails: { type: String, default: "" }, // Stores the raw HTML
  },
  { timestamps: true }
);

// Check if the model exists before compiling it to prevent overwrite errors in Next.js
const QuestionPaper = models.QuestionPaper || mongoose.model("QuestionPaper", questionPaperSchema);

export default QuestionPaper;