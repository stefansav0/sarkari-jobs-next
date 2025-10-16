import mongoose from "mongoose";
import slugify from "slugify";

const answerKeySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  conductedby: String,
  applicationBegin: { type: String },
  lastDateApply: { type: String },
  examDate: { type: String },
  admitcard: { type: String },
  answerKeyRelease: { type: String },
  howToCheck: { type: String },
  importantLinks: {
    downloadAnswerKey: { type: String },
    officialWebsite: { type: String }
  },

  publishDate: { type: Date, default: Date.now }
});

// Auto-generate slug before saving
answerKeySchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified("department")) {
    this.departmentSlug = slugify(this.department, { lower: true, strict: true });
  }
  next();
});

// Avoid recompilation errors in Next.js (due to hot reloads)
const AnswerKey = mongoose.models.AnswerKey || mongoose.model("AnswerKey", answerKeySchema);
export default AnswerKey;
