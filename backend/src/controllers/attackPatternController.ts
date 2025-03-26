import { Request, Response } from 'express';
import { AttackPattern, IAttackPattern } from '../models/AttackPattern.js';

// Get all attack patterns
export const getAllAttackPatterns = async (req: Request, res: Response): Promise<void> => {
  try {
    const patterns = await AttackPattern.find();
    res.status(200).json(patterns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attack patterns', error });
  }
};

// Get a single attack pattern by ID
export const getAttackPatternById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pattern = await AttackPattern.findById(req.params.id);
    if (!pattern) {
      res.status(404).json({ message: 'Attack pattern not found' });
      return;
    }
    res.status(200).json(pattern);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attack pattern', error });
  }
};

// Create a new attack pattern
export const createAttackPattern = async (req: Request, res: Response): Promise<void> => {
  try {
    const pattern = new AttackPattern(req.body);
    const savedPattern = await pattern.save();
    res.status(201).json(savedPattern);
  } catch (error) {
    res.status(400).json({ message: 'Error creating attack pattern', error });
  }
};

// Update an attack pattern
export const updateAttackPattern = async (req: Request, res: Response): Promise<void> => {
  try {
    const pattern = await AttackPattern.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!pattern) {
      res.status(404).json({ message: 'Attack pattern not found' });
      return;
    }
    res.status(200).json(pattern);
  } catch (error) {
    res.status(400).json({ message: 'Error updating attack pattern', error });
  }
};

// Delete an attack pattern
export const deleteAttackPattern = async (req: Request, res: Response): Promise<void> => {
  try {
    const pattern = await AttackPattern.findByIdAndDelete(req.params.id);
    if (!pattern) {
      res.status(404).json({ message: 'Attack pattern not found' });
      return;
    }
    res.status(200).json({ message: 'Attack pattern deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting attack pattern', error });
  }
}; 
