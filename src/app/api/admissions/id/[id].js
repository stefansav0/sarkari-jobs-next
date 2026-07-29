import { connectDB } from '@/lib/db';
import Admission from '@/lib/models/Admission';
import slugify from 'slugify';

export default async function handler(req, res) {
  // ✅ Awaiting DB connection inside the handler is safer for serverless environments
  await connectDB();

  const { method } = req;
  const { id } = req.query;

  if (!id) return res.status(400).json({ message: "ID is required" });

  if (method === 'PUT') {
    try {
      const updatedData = { ...req.body };

      // 🛡️ Slug Handling
      // If a manual slug is provided, format it. Otherwise, auto-generate from the title.
      if (updatedData.slug) {
        updatedData.slug = slugify(updatedData.slug, { lower: true, strict: true });
      } else if (updatedData.title) {
        updatedData.slug = slugify(updatedData.title, { lower: true, strict: true });
      }

      // 🛡️ Data Sanitization for new array structures
      if (updatedData.keyDates && !Array.isArray(updatedData.keyDates)) {
        updatedData.keyDates = [];
      }
      
      if (updatedData.importantLinks) {
        if (updatedData.importantLinks.applyOnline && !Array.isArray(updatedData.importantLinks.applyOnline)) {
          updatedData.importantLinks.applyOnline = [];
        }
        if (updatedData.importantLinks.downloadNotice && !Array.isArray(updatedData.importantLinks.downloadNotice)) {
          updatedData.importantLinks.downloadNotice = [];
        }
      }

      // { runValidators: true } ensures Mongoose validates the updated fields
      const updatedAdmission = await Admission.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

      if (!updatedAdmission) {
        return res.status(404).json({ message: "Admission not found" });
      }

      return res.status(200).json({ message: "✅ Admission updated successfully", admission: updatedAdmission });
    } catch (error) {
      // Handle duplicate slug error specifically
      if (error.code === 11000 && error.keyPattern?.slug) {
        return res.status(409).json({ message: "❌ This slug is already in use by another admission." });
      }
      return res.status(500).json({ message: "❌ Error updating admission", error: error.message });
    }
  } else if (method === 'DELETE') {
    try {
      const deleted = await Admission.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Admission not found" });
      }

      return res.status(200).json({ message: "✅ Admission deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "❌ Error deleting admission", error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}