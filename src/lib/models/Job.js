// /lib/models/Job.js

import mongoose from "mongoose";
import slugify from "slugify";

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true, trim: true },
    department: { type: String, required: true, trim: true },
    eligibility: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, unique: true, trim: true },
    applyLink: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) =>
          /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(v),
        message: "Invalid URL format for apply link"
      }
    },
    lastDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "closed", "pending", "expired"],
      default: "active",
      lowercase: true
    },
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
      applyOnline: { type: String, trim: true },
      downloadNotification: { type: String, trim: true },
      officialWebsite: { type: String, trim: true }
    }
  },
  { timestamps: true }
);

JobSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.lastDate && new Date(this.lastDate) < new Date()) {
    this.status = "expired";
  }

  next();
});

JobSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }

  if (update.lastDate && new Date(update.lastDate) < new Date()) {
    update.status = "expired";
  }

  next();
});

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
