import type { Request, Response, NextFunction } from 'express';
import { expensesService, ExpensesService } from './expenses.service.ts';

export class ExpensesController {
  private service: ExpensesService;

  constructor(service?: ExpensesService) {
    this.service = service || expensesService;
  }

  getExpenses = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const expenses = this.service.listExpenses();
      res.json(expenses);
    } catch (err) {
      next(err);
    }
  };

  getExpense = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const expense = this.service.getExpense(req.params.id);
      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json(expense);
    } catch (err) {
      next(err);
    }
  };

  saveExpense = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.saveExpense(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode === 400) {
        res.status(400).json({ error: err.message });
        return;
      }
      next(err);
    }
  };

  deleteExpense = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = this.service.deleteExpense(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const expensesController = new ExpensesController();
