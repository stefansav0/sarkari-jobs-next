import mongoose from "mongoose";
import slugify from "slugify";

const admitCardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  conductedby: { type: String, trim: true },
  
  // ✅ NEW: SEO Fields
  seoKeywords: { type: String, trim: true },
  metaDescription: { type: String, trim: true },

  // ✅ NEW: Dynamic Key Dates (Replaces hardcoded dates, though old ones are kept below for DB backward compatibility)
  keyDates: [
    {
      label: { type: String, trim: true },
      value: { type: String, trim: true }
    }
  ],

  // 🔄 LEGACY FIELDS: Kept so old database entries don't break. 
  // (Your frontend's useEffect automatically migrates these to keyDates on edit)
  examDate: { type: String, trim: true },
  applicationBegin: { type: String, trim: true },
  lastDateApply: { type: String, trim: true },
  admitCard: { type: String, trim: true },
  publishDate: { type: String, trim: true }, // Changed to string to match flexible input, or keep as Date if you strict parse it

  description: { type: String, trim: true },
  howToDownload: { type: String, trim: true },
  
  // ✅ UPDATED: Multiple SEO links
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

// Auto-generate or format the slug before saving (New Documents)
admitCardSchema.pre("save", function (next) {
  // If a manual slug is provided, make sure it is properly formatted
  if (this.slug && this.isModified("slug")) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  } 
  // If no slug is provided, generate it from the title
  else if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Update the slug if the title is updated or manual slug is passed (Edited Documents)
admitCardSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  
  // If user provided a manual slug during the update, format it
  if (update.slug) {
    update.slug = slugify(update.slug, { lower: true, strict: true });
  } 
  // If user cleared the slug but updated the title, regenerate it
  else if (update.title && update.slug === "") {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  
  next();
});

// Prevent model overwrite error in dev hot-reloads
export default mongoose.models.AdmitCard || mongoose.model("AdmitCard", admitCardSchema);