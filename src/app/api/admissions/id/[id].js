import { connectDB } from '@/lib/db';
import Admission from '@/lib/models/Admission';
import slugify from 'slugify';

connectDB();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) return res.status(400).json({ message: "ID is required" });

  if (method === 'PUT') {
    try {
      const updatedData = { ...req.body };

      if (req.body.title) {
        updatedData.slug = slugify(req.body.title, { lower: true, strict: true });
      }

      const updatedAdmission = await Admission.findByIdAndUpdate(id, updatedData, { new: true });

      if (!updatedAdmission) {
        return res.status(404).json({ message: "Admission not found" });
      }

      return res.status(200).json({ message: "✅ Admission updated successfully", admission: updatedAdmission });
    } catch (error) {
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
