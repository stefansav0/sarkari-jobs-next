import mongoose from "mongoose";
import slugify from "slugify";

const answerKeySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  
  // ✅ Manual Slug (Provided by frontend)
  slug: { type: String, unique: true, lowercase: true, trim: true },
  
  // ✅ Added SEO Fields
  seoKeywords: { type: String, trim: true },
  metaDescription: { type: String, trim: true },
  
  conductedby: { type: String, trim: true },
  
  // ✅ Replaced hardcoded date strings with dynamic keyDates array
  keyDates: [
    {
      label: { type: String, trim: true },
      value: { type: String, trim: true }
    }
  ],

  howToCheck: { type: String, trim: true }, // Holds HTML from TipTap editor
  
  // Matches the frontend form structure for multiple SEO links
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
}, { timestamps: true }); 

// Sanitize manual slug or auto-generate if missing (New Documents)
answerKeySchema.pre("save", function (next) {
  // If a manual slug is provided, make sure it is perfectly formatted
  if (this.isModified("slug") && this.slug) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  } 
  // If no slug was provided, auto-generate it from the title
  else if (this.isModified("title") && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  
  next();
});

// Sanitize manual slug or auto-generate if missing (Edited Documents)
answerKeySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  
  // If the update payload includes a manual slug, sanitize it
  if (update.slug) {
    update.slug = slugify(update.slug, { lower: true, strict: true });
  } 
  // If title is updated but no slug is provided, auto-update the slug
  else if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  
  next();
});

// Prevent model overwrite error in dev hot-reloads
export default mongoose.models.AnswerKey || mongoose.model("AnswerKey", answerKeySchema);