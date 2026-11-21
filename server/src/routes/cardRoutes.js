import express from 'express';
import {
  getAllCards,
  getCardByDate,
  createOrUpdateCard,
  toggleMorningTask,
  deleteCard,
  getStats
} from '../controllers/cardController.js';

const router = express.Router();

router.get('/', getAllCards);
router.get('/stats', getStats);
router.get('/:date', getCardByDate);
router.post('/:date', createOrUpdateCard);
router.put('/:date', createOrUpdateCard);
router.patch('/:date/tasks/:taskId/toggle', toggleMorningTask);
router.delete('/:date', deleteCard);

export default router;
