import { Router } from 'express';
import { reportingService } from './reports.service.js';

export const reportingRouter = Router();

reportingRouter.get('/summary', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const overview = reportingService.getOverview(startDate, endDate);
    res.json(overview);
  } catch (err) {
    next(err);
  }
});

reportingRouter.get('/pnl', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const pnl = reportingService.getProfitAndLoss(startDate, endDate);
    res.json(pnl);
  } catch (err) {
    next(err);
  }
});

reportingRouter.get('/aging', (req, res, next) => {
  try {
    const aging = reportingService.getAccountsReceivableAging();
    res.json(aging);
  } catch (err) {
    next(err);
  }
});

export const reportsRouter = reportingRouter;
