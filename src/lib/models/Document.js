import mongoose from "mongoose";
import slugify from "slugify";

const documentSchema = new mongoose.Schema(
  {
    // Basic Details
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true }, 
    category: { type: String, required: true, trim: true },
    serviceType: { type: String, trim: true },
    link: { type: String, trim: true },
    
    // Content & Description
    description: { type: String, trim: true }, // Short description
    fullDescription: { type: String, trim: true }, // Full guide/details
    
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

// Auto-generate unique slug before validation/saving
documentSchema.pre("validate", async function (next) {
  if (this.isModified("title") || this.isNew) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    let currentSlug = baseSlug;
    let counter = 1;

    const Model = this.constructor;
    while (await Model.findOne({ slug: currentSlug, _id: { $ne: this._id } })) {
      currentSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = currentSlug;
  }
  next();
});

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;