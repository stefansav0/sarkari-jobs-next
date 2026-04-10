import mongoose from 'mongoose';
import slugify from 'slugify';

const AdmissionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  conductedBy: { type: String, required: true, trim: true },
  eligibility: { type: String, trim: true },
  ageLimit: { type: String, trim: true },
  course: { type: String, trim: true },
  applicationFee: { type: String, trim: true }, // Holds TipTap HTML
  fullCourseDetails: { type: String, trim: true }, // Holds TipTap HTML

  // 🟢 All dates as strings (allows for formats like "TBA" or "15 May 2026")
  examDate: { type: String, trim: true },
  publishDate: { type: String, trim: true },
  applicationBegin: { type: String, trim: true },
  lastDateApply: { type: String, trim: true },
  admissionDate: { type: String, trim: true },

  // ✅ UPDATED: Matches the new frontend form structure for multiple SEO links
  importantLinks: {
    applyOnline: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true }
      }
    ],
    downloadNotice: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true }
      }
    ],
    officialWebsite: { type: String, trim: true },
  },

  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
}, { timestamps: true });

// Auto-generate slug & check expiration before saving (New Documents)
AdmissionSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  // Basic expiration check if a valid date is provided
  if (this.lastDateApply && !isNaN(Date.parse(this.lastDateApply))) {
    const lastDate = new Date(this.lastDateApply);
    if (lastDate < new Date()) {
      this.status = 'expired';
    } else {
      this.status = 'active';
    }
  }

  next();
});

// Update slug & check expiration on edit (Edited Documents)
AdmissionSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }

  // Recalculate status if the deadline date is edited
  if (update.lastDateApply && !isNaN(Date.parse(update.lastDateApply))) {
    const lastDate = new Date(update.lastDateApply);
    if (lastDate < new Date()) {
      update.status = 'expired';
    } else {
      update.status = 'active';
    }
  }

  next();
});

// Prevent model overwrite error in dev hot-reloads
export default mongoose.models.Admission || mongoose.model('Admission', AdmissionSchema);