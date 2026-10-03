export * from './errors';
export * from './endpoints';
export * from './client';

import {
  getAllBills,
  saveBill,
  deleteBill,
  getAllClients,
  saveClient,
  deleteClient,
  getAllProducts,
  saveProduct,
  deleteProduct,
  getAllExpenses,
  saveExpense,
  deleteExpense,
  getAllPurchases,
  savePurchase,
  deletePurchase,
  getAllReceipts,
  saveReceipt,
  deleteReceipt,
  getAllRecurring,
  saveRecurring,
  deleteRecurring,
  getAllProfiles,
  getProfile,
  saveProfile,
  saveBusinessProfile,
  deleteBusinessProfile,
  getInvoiceNumberSettings,
  saveInvoiceNumberSettings,
  getStockAlertSettings,
  saveStockAlertSettings,
  getNextInvoiceNumber,
  getTermsTemplates,
  saveTermsTemplate,
  deleteTermsTemplate,
} from '../../store';

export const billsApi = {
  getAll: getAllBills,
  save: saveBill,
  delete: deleteBill,
};

export const clientsApi = {
  getAll: getAllClients,
  save: saveClient,
  delete: deleteClient,
};

export const productsApi = {
  getAll: getAllProducts,
  save: saveProduct,
  delete: deleteProduct,
};

export const expensesApi = {
  getAll: getAllExpenses,
  save: saveExpense,
  delete: deleteExpense,
};

export const purchasesApi = {
  getAll: getAllPurchases,
  save: savePurchase,
  delete: deletePurchase,
};

export const receiptsApi = {
  getAll: getAllReceipts,
  save: saveReceipt,
  delete: deleteReceipt,
};

export const recurringApi = {
  getAll: getAllRecurring,
  save: saveRecurring,
  delete: deleteRecurring,
};

export const profilesApi = {
  getAll: getAllProfiles,
  getProfile,
  save: saveProfile,
  saveBusinessProfile,
  delete: deleteBusinessProfile,
};

export const metaApi = {
  getInvoiceNumberSettings,
  saveInvoiceNumberSettings,
  getStockAlertSettings,
  saveStockAlertSettings,
  getNextInvoiceNumber,
};

export const templatesApi = {
  getAll: getTermsTemplates,
  save: saveTermsTemplate,
  delete: deleteTermsTemplate,
};

