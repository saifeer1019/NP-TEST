// models/Categories.ts
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Categories || mongoose.model('Categories', CategorySchema);
