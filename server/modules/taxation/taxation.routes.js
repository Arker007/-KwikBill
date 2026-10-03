import { Router } from 'express';
import { taxationService } from './taxation.service.js';

export const taxationRouter = Router();

taxationRouter.get('/summary', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = taxationService.getTaxSummary(startDate, endDate);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

taxationRouter.get('/gstr1', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const gstr1 = taxationService.getGstr1Summary(startDate, endDate);
    res.json(gstr1);
  } catch (err) {
    next(err);
  }
});

taxationRouter.get('/gstr3b', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const gstr3b = taxationService.getGstr3bSummary(startDate, endDate);
    res.json(gstr3b);
  } catch (err) {
    next(err);
  }
});
