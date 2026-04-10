import mongoose from "mongoose";
import slugify from "slugify";

const answerKeySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  conductedby: { type: String, trim: true },
  applicationBegin: { type: String, trim: true },
  lastDateApply: { type: String, trim: true },
  examDate: { type: String, trim: true },
  admitcard: { type: String, trim: true },
  answerKeyRelease: { type: String, trim: true },
  howToCheck: { type: String, trim: true }, // Will hold HTML from your TipTap editor
  
  // ✅ UPDATED: Matches the new frontend form structure for multiple SEO links
  importantLinks: {
    downloadAnswerKey: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true }
      }
    ],
    officialWebsite: { type: String, trim: true }
  },

  publishDate: { type: Date, default: Date.now }
}, { timestamps: true }); // Added timestamps for createdAt/updatedAt tracking

// Auto-generate the slug from the title before saving (New Documents)
answerKeySchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  // Removed the rogue 'department' code here!
  next();
});

// Update the slug if the title is updated (Edited Documents)
answerKeySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  next();
});

// Prevent model overwrite error in dev hot-reloads
export default mongoose.models.AnswerKey || mongoose.model("AnswerKey", answerKeySchema);