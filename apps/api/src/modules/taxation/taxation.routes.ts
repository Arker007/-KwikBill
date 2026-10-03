import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { taxationService } from './taxation.service.ts';

export const taxationRouter = Router();

taxationRouter.get('/summary', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const summary = taxationService.getTaxSummary(startDate, endDate);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

taxationRouter.get('/gstr1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const gstr1 = taxationService.getGstr1Summary(startDate, endDate);
    res.json(gstr1);
  } catch (err) {
    next(err);
  }
});

taxationRouter.get('/gstr3b', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const gstr3b = taxationService.getGstr3bSummary(startDate, endDate);
    res.json(gstr3b);
  } catch (err) {
    next(err);
  }
});
