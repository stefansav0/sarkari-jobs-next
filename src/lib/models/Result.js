import mongoose from "mongoose";
import slugify from "slugify";

const ResultSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },

  conductedBy: { type: String, trim: true },                 
  department: { type: String, trim: true },
  category: { type: String, trim: true },
  eligibility: { type: String, trim: true },
  ageLimit: { type: String, trim: true },

  examDate: { type: String, trim: true },
  resultDate: { type: String, trim: true },
  postDate: { type: Date, default: Date.now },  

  shortInfo: { type: String, trim: true },                  
  howToCheck: { type: String, trim: true },

  importantDates: {
    applicationBegin: { type: String, trim: true },
    lastDateApply: { type: String, trim: true },
    examDate: { type: String, trim: true },
    resultDate: { type: String, trim: true }
  },

  // ✅ UPDATED: Matches the new frontend form structure perfectly
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

// Auto-generate the slug from the title before saving
ResultSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Update the slug if the title is updated via findOneAndUpdate
ResultSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  next();
});

// Prevent model overwrite upon hot reload in dev
const Result = mongoose.models.Result || mongoose.model("Result", ResultSchema);

export default Result;