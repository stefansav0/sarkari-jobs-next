// models/Admission.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const AdmissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  conductedBy: { type: String },
  eligibility: { type: String },
  ageLimit: { type: String },
  course: { type: String },
  applicationFee: { type: String },
  fullCourseDetails: { type: String },
  examDate: { type: Date },

  applicationBegin: { type: Date },
  lastDateApply: { type: Date },
  admissionDate: { type: String },

  importantLinks: {
    applyOnline: { type: String },
    downloadNotice: { type: String },
    officialWebsite: { type: String },
  },

  publishDate: { type: Date, default: Date.now },

  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
});

// Pre-save hook to auto-generate slug and set status
AdmissionSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.lastDateApply && new Date(this.lastDateApply) < new Date()) {
    this.status = 'expired';
  }

  next();
});

// Prevent model overwrite in dev
export default mongoose.models.Admission || mongoose.model('Admission', AdmissionSchema);
