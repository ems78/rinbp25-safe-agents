import express from 'express';
import {
  getAllAttackPatterns,
  getAttackPatternById,
  createAttackPattern,
  updateAttackPattern,
  deleteAttackPattern
} from '../controllers/attackPatternController.js';

const router = express.Router();

// Attack pattern routes
router.get('/', getAllAttackPatterns);
router.get('/:id', getAttackPatternById);
router.post('/', createAttackPattern);
router.put('/:id', updateAttackPattern);
router.delete('/:id', deleteAttackPattern);

export default router; 
