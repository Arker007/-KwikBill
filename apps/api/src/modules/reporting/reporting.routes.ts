import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { reportingService } from './reporting.service.ts';

export const reportingRouter = Router();

reportingRouter.get('/summary', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const overview = reportingService.getOverview(startDate, endDate);
    res.json(overview);
  } catch (err) {
    next(err);
  }
});

reportingRouter.get('/pnl', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const pnl = reportingService.getProfitAndLoss(startDate, endDate);
    res.json(pnl);
  } catch (err) {
    next(err);
  }
});

reportingRouter.get('/aging', (req: Request, res: Response, next: NextFunction) => {
  try {
    const aging = reportingService.getAccountsReceivableAging();
    res.json(aging);
  } catch (err) {
    next(err);
  }
});

export const reportsRouter = reportingRouter;
