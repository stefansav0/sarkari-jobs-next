import mongoose from "mongoose";
import slugify from "slugify";

const documentSchema = new mongoose.Schema(
  {
    // Basic Details
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true }, 
    category: { type: String, required: true, trim: true },
    serviceType: { type: String, trim: true },
    link: { type: String, required: true, trim: true }, // Added required: true to match frontend validation
    
    // Media
    coverImageUrl: { type: String, trim: true }, // NEW: Added to support cover image URLs
    
    // Content & Description
    description: { type: String, trim: true },
    fullDescription: { type: String, trim: true },
    contentFormat: { type: String, enum: ["html", "text"], default: "html" }, // NEW: Supports HTML or Plain Text
    
    // SEO Details
    metaDescription: { type: String, trim: true },
    seoKeywords: { type: String, trim: true },
    
    // Metadata
    publishDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "expired"], default: "active" },
  },
  { 
    timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Format and ensure unique slug before validation/saving
documentSchema.pre("validate", async function (next) {
  // Check if we need to generate/format a slug
  if (this.isModified("title") || this.isModified("slug") || this.isNew) {
    
    // If the frontend passed a slug, use it as the base. Otherwise, fallback to the title.
    const sourceForSlug = this.slug || this.title;
    
    if (sourceForSlug) {
      // Clean up the slug (removes spaces, special characters, forces lowercase)
      const baseSlug = slugify(sourceForSlug, { lower: true, strict: true });
      let currentSlug = baseSlug;
      let counter = 1;

      // Ensure uniqueness in the database
      const Model = this.constructor;
      while (await Model.findOne({ slug: currentSlug, _id: { $ne: this._id } })) {
        currentSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      this.slug = currentSlug;
    }
  }
  next();
});

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;