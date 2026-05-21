import mongoose from 'mongoose';
import slugify from 'slugify';

const StudyNewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true }, // HTML content
    coverImage: { type: String }, // Optional
    author: { type: String, default: 'Admin' },
    publishDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-generate slug before save
StudyNewsSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Avoid model overwrite upon hot reloads
const StudyNews = mongoose.models.StudyNews || mongoose.model('StudyNews', StudyNewsSchema);

export default StudyNews;
