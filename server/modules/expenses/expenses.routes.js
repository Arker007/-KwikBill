import { Router } from 'express';
import { expensesController } from './expenses.controller.js';

export const expensesRouter = Router();

expensesRouter.get('/', expensesController.getExpenses);
expensesRouter.get('/:id', expensesController.getExpense);
expensesRouter.post('/', expensesController.saveExpense);
expensesRouter.put('/', expensesController.saveExpense);
expensesRouter.put('/:id', expensesController.saveExpense);
expensesRouter.delete('/:id', expensesController.deleteExpense);
