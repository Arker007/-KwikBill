import { expensesService } from './expenses.service.js';

export class ExpensesController {
  constructor(service = expensesService) {
    this.service = service;
  }

  getExpenses = (req, res, next) => {
    try {
      const expenses = this.service.listExpenses();
      res.json(expenses);
    } catch (err) {
      next(err);
    }
  };

  getExpense = (req, res, next) => {
    try {
      const expense = this.service.getExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json(expense);
    } catch (err) {
      next(err);
    }
  };

  saveExpense = (req, res, next) => {
    try {
      const result = this.service.saveExpense(req.body);
      res.json(result);
    } catch (err) {
      if (err.statusCode === 400) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  };

  deleteExpense = (req, res, next) => {
    try {
      const result = this.service.deleteExpense(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const expensesController = new ExpensesController();
