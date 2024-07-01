import express from 'express';
import { getDeal } from '../database/deals.js';

const router = express.Router();

// POST A DEAL
router.post('/title', async (req, res, next) => {
    const { title } = req.body;
    console.log("Deal received:", title);
    try {
        const deal = await getDeal(title);

        if (deal) {
            res.json(deal);
        } else {
            res.status(404).json({ error: 'Deal not found' });
        }
    } catch (error) {
        next(error);
    }
});

export default router;