import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    house: { type: String, required: true, enum: ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'] },
    wand: { type: String, required: true },
    patronus: { type: String, required: true },
    bloodStatus: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Character', characterSchema);
