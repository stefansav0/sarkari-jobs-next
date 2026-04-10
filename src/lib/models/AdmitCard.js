import mongoose from "mongoose";
import slugify from "slugify";

const admitCardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  conductedby: { type: String, trim: true },
  examDate: { type: String, trim: true },
  applicationBegin: { type: String, trim: true },
  lastDateApply: { type: String, trim: true },
  admitCard: { type: String, trim: true },
  publishDate: { type: Date, default: Date.now },
  description: { type: String, trim: true },
  howToDownload: { type: String, trim: true },
  
  // ✅ UPDATED: Matches the new frontend form structure for multiple SEO links
  importantLinks: {
    downloadAdmitCard: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true }
      }
    ],
    officialWebsite: { type: String, trim: true },
  },
}, { timestamps: true });

// Auto-generate the slug from the title before saving (New Documents)
admitCardSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Update the slug if the title is updated (Edited Documents)
admitCardSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  next();
});

// Prevent model overwrite error in dev hot-reloads
export default mongoose.models.AdmitCard || mongoose.model("AdmitCard", admitCardSchema);