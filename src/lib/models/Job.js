// /lib/models/Job.js

import mongoose from "mongoose";
import slugify from "slugify";

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true, trim: true },
    slug: { type: String, lowercase: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    eligibility: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    
    // SEO Fields Added
    seoKeywords: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    
    // Changed to String to support free-text like "25th Jan 2024"
    lastDate: { type: String, required: true, trim: true },
    
    status: {
      type: String,
      enum: ["active", "closed", "pending", "expired"],
      default: "active",
      lowercase: true
    },
    
    // HTML Supported Text Fields
    ageLimit: { type: String, trim: true },
    applicationFee: { type: String, trim: true },
    vacancy: { type: String, trim: true },
    
    importantDates: {
      applicationBegin: { type: String, trim: true },
      lastDateApply: { type: String, trim: true },
      lastDateFee: { type: String, trim: true },
      examDate: { type: String, trim: true },
      admitCard: { type: String, trim: true }
    },
    
    importantLinks: {
      applyOnline: [
        {
          label: { type: String, trim: true },
          url: { type: String, trim: true }
        }
      ],
      downloadNotification: [
        {
          label: { type: String, trim: true },
          url: { type: String, trim: true }
        }
      ],
      officialWebsite: { type: String, trim: true }
    }
  },
  { timestamps: true }
);

// Pre-save hook to handle slug generation
JobSchema.pre("save", function (next) {
  // If slug is provided manually, slugify it to ensure URL safety. 
  // Otherwise, fallback to generating it from the title.
  if (this.isModified("title") || this.isModified("slug")) {
    const baseSlugString = this.slug ? this.slug : this.title;
    this.slug = slugify(baseSlugString, { lower: true, strict: true });
  }

  next();
});

// Pre-update hook to handle slug updates
JobSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // Handle manual slug update or title update
  if (update.slug || update.title) {
    const baseSlugString = update.slug ? update.slug : update.title;
    update.slug = slugify(baseSlugString, { lower: true, strict: true });
  }

  next();
});

export default mongoose.models.Job || mongoose.model("Job", JobSchema);