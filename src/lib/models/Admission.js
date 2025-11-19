import mongoose from 'mongoose';
import slugify from 'slugify';

const AdmissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  conductedBy: { type: String, required: true },
  eligibility: { type: String },
  ageLimit: { type: String },
  course: { type: String },
  applicationFee: { type: String },
  fullCourseDetails: { type: String },

  // 🟢 All dates as strings
  examDate: { type: String },
  publishDate: { type: String },
  applicationBegin: { type: String },
  lastDateApply: { type: String },
  admissionDate: { type: String },

  importantLinks: {
    applyOnline: { type: String },
    downloadNotice: { type: String },
    officialWebsite: { type: String },
  },

  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
}, { timestamps: true });

AdmissionSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.lastDateApply && !isNaN(Date.parse(this.lastDateApply))) {
    const lastDate = new Date(this.lastDateApply);
    if (lastDate < new Date()) this.status = 'expired';
  }

  next();
});

export default mongoose.models.Admission || mongoose.model('Admission', AdmissionSchema);
