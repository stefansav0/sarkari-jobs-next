import mongoose from 'mongoose';
import slugify from 'slugify';

const AdmissionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  
  // ✅ NEW: SEO Fields
  seoKeywords: { type: String, trim: true },
  metaDescription: { type: String, trim: true },
  
  conductedBy: { type: String, required: true, trim: true },
  
  // All these hold TipTap HTML now
  eligibility: { type: String, trim: true },
  ageLimit: { type: String, trim: true },
  course: { type: String, trim: true },
  applicationFee: { type: String, trim: true }, 
  fullCourseDetails: { type: String, trim: true }, 

  // ✅ NEW: Dynamic Key Dates array replaces static dates
  keyDates: [
    {
      label: { type: String, trim: true },
      date: { type: String, trim: true }
    }
  ],

  // Matches the new frontend form structure for multiple SEO links
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
  // 1. Slug Handling
  if (this.slug) {
    // If a manual slug was provided, just sanitize it
    this.slug = slugify(this.slug, { lower: true, strict: true });
  } else if (this.title) {
    // If no slug was provided, generate it from the title
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  // 2. Expiration logic (Finds a date labeled "Last Date...")
  const deadlineObj = this.keyDates?.find(d => 
    d.label && d.label.toLowerCase().includes('last date')
  );

  if (deadlineObj && deadlineObj.date && !isNaN(Date.parse(deadlineObj.date))) {
    const lastDate = new Date(deadlineObj.date);
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
  
  // 1. Slug Handling
  if (update.slug) {
    update.slug = slugify(update.slug, { lower: true, strict: true });
  } else if (update.title && !update.slug) {
    // Only auto-generate if title is updated and NO manual slug is provided
    update.slug = slugify(update.title, { lower: true, strict: true });
  }

  // 2. Expiration logic (Finds a date labeled "Last Date...")
  if (update.keyDates) {
    const deadlineObj = update.keyDates.find(d => 
      d.label && d.label.toLowerCase().includes('last date')
    );

    if (deadlineObj && deadlineObj.date && !isNaN(Date.parse(deadlineObj.date))) {
      const lastDate = new Date(deadlineObj.date);
      if (lastDate < new Date()) {
        update.status = 'expired';
      } else {
        update.status = 'active';
      }
    }
  }

  next();
});

// Prevent model overwrite error in dev hot-reloads
export default mongoose.models.Admission || mongoose.model('Admission', AdmissionSchema);