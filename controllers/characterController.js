import Character from '../models/Character.js';
import path from 'path';
import fs from 'fs';

export const createCharacter = async (req, res) => {
  const { name, house, wand, patronus, bloodStatus, description } = req.body;
  if (!name || !house || !wand || !patronus || !bloodStatus || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  const character = await Character.create({
    name,
    house,
    wand,
    patronus,
    bloodStatus,
    description,
    image,
    createdBy: req.user._id,
  });

  res.status(201).json(character);
};

export const getCharacters = async (req, res) => {
  const { search, house } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (house) query.house = house;

  const characters = await Character.find(query).sort({ createdAt: -1 });
  res.json(characters);
};

export const getCharacterById = async (req, res) => {
  const character = await Character.findById(req.params.id);
  if (!character) return res.status(404).json({ message: 'Character not found' });
  res.json(character);
};

export const updateCharacter = async (req, res) => {
  const { name, house, wand, patronus, bloodStatus, description } = req.body;
  const character = await Character.findById(req.params.id);
  if (!character) return res.status(404).json({ message: 'Character not found' });

  if (character.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update' });
  }

  if (req.file) {
    if (character.image) {
      const oldImage = character.image.replace('/uploads/', '');
      const oldPath = path.join(process.cwd(), 'uploads', oldImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    character.image = `/uploads/${req.file.filename}`;
  }

  character.name = name || character.name;
  character.house = house || character.house;
  character.wand = wand || character.wand;
  character.patronus = patronus || character.patronus;
  character.bloodStatus = bloodStatus || character.bloodStatus;
  character.description = description || character.description;

  const updatedCharacter = await character.save();
  res.json(updatedCharacter);
};

export const deleteCharacter = async (req, res) => {
  const character = await Character.findById(req.params.id);
  if (!character) return res.status(404).json({ message: 'Character not found' });

  if (character.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete' });
  }

  if (character.image) {
    const imageName = character.image.replace('/uploads/', '');
    const imagePath = path.join(process.cwd(), 'uploads', imageName);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }

  await character.remove();
  res.json({ message: 'Character deleted' });
};
