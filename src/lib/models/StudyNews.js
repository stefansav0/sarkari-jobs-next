import mongoose from 'mongoose';
import slugify from 'slugify';

const StudyNewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true }, // Made required since frontend enforces it
    description: { type: String, required: true }, // HTML content
    coverImage: { type: String }, // Optional (URL or Base64)
    metaDescription: { type: String }, // ✅ Added meta description
    keywords: { type: String }, // ✅ Added keywords
    author: { type: String, default: 'Admin' },
    publishDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Format manual slug or auto-generate before save
StudyNewsSchema.pre('save', function (next) {
  if (!this.slug) {
    // If no slug is provided at all, auto-generate it from the title
    this.slug = slugify(this.title, { lower: true, strict: true });
  } else if (this.isModified('slug')) {
    // If a manual slug is provided from the frontend, just ensure it is properly formatted and safe
    this.slug = slugify(this.slug, { lower: true, strict: true });
  }
  next();
});

// Avoid model overwrite upon hot reloads
const StudyNews = mongoose.models.StudyNews || mongoose.model('StudyNews', StudyNewsSchema);

export default StudyNews;