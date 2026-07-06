import mongoose from "mongoose";
import slugify from "slugify";

const ResultSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },

  // --- NEW: SEO Fields ---
  seoKeywords: { type: String, trim: true },
  metaDescription: { type: String, trim: true },

  conductedBy: { type: String, trim: true },                 
  department: { type: String, trim: true },
  category: { type: String, trim: true },
  eligibility: { type: String, trim: true },
  ageLimit: { type: String, trim: true },

  examDate: { type: String, trim: true },
  resultDate: { type: String, trim: true },
  postDate: { type: Date, default: Date.now },  

  // --- UPDATED: HTML Support ---
  detailedHtml: { type: String, trim: true }, // Replaced shortInfo
  howToCheck: { type: String, trim: true },   // Now expects Tailwind HTML

  importantDates: {
    applicationBegin: { type: String, trim: true },
    lastDateApply: { type: String, trim: true },
    examDate: { type: String, trim: true },
    resultDate: { type: String, trim: true }
  },

  importantLinks: {
    downloadResult: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true }
      }
    ],
    officialWebsite: { type: String, trim: true }
  }
}, { timestamps: true });

// Auto-generate the slug from the title before saving ONLY if one isn't provided
ResultSchema.pre("save", function (next) {
  // If the title exists but the slug is empty/missing, auto-generate it
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Update the slug if the title is updated via findOneAndUpdate, but respect manual slugs
ResultSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  
  // If updating the title and NOT explicitly updating the slug, regenerate it
  if (update.title && !update.slug) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  next();
});

// Prevent model overwrite upon hot reload in dev
const Result = mongoose.models.Result || mongoose.model("Result", ResultSchema);

export default Result;