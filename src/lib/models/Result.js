import mongoose from "mongoose";
import slugify from "slugify";

const ResultSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },

  conductedBy: { type: String },                 
  department: { type: String },
  category: { type: String },
  eligibility: { type: String },
  ageLimit: { type: String },

  examDate: { type: String },
  resultDate: { type: String },
  postDate: { type: Date, default: Date.now },  

  shortInfo: { type: String },                  
  howToCheck: { type: String },

  importantDates: {
    applicationBegin: String,
    lastDateApply: String,
    examDate: String,
    resultDate: String
  },

  importantLinks: [                              
    {
      label: String,
      url: String
    }
  ]
}, { timestamps: true });

ResultSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Prevent model overwrite upon hot reload in dev
const Result = mongoose.models.Result || mongoose.model("Result", ResultSchema);

export default Result;
