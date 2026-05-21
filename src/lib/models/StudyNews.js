import mongoose from "mongoose";
import slugify from "slugify";

const StudyNewsSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFO
    // =========================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    }, // HTML Content

    // =========================
    // IMAGE
    // =========================
    coverImage: {
      type: String,
      default: "",
    }, // Base64 or uploaded image

    imageUrl: {
      type: String,
      default: "",
    }, // External image URL

    // =========================
    // AUTHOR
    // =========================
    author: {
      type: String,
      default: "Admin",
    },

    // =========================
    // SEO
    // =========================
    seoTitle: {
      type: String,
      trim: true,
      default: "",
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    keywords: {
      type: [String],
      default: [],
    },

    // =========================
    // VISIBILITY
    // =========================
    visibility: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    // =========================
    // PUBLISH DATE
    // =========================
    publishDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// AUTO GENERATE SLUG
// =========================
StudyNewsSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  // Convert keywords string to array if needed
  if (typeof this.keywords === "string") {
    this.keywords = this.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }

  next();
});

// =========================
// INDEXES FOR SEO & SEARCH
// =========================
StudyNewsSchema.index({ title: "text", metaDescription: "text" });

// =========================
// PREVENT MODEL OVERWRITE
// =========================
const StudyNews =
  mongoose.models.StudyNews ||
  mongoose.model("StudyNews", StudyNewsSchema);

export default StudyNews;