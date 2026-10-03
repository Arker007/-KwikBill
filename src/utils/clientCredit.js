/**
 * Backward-compatibility facade for client credit balance.
 * Canonical implementation is now at src/features/clients/utils/clientCredit.ts
 */

export {
  getBillOverpayment,
  getClientCredit,
  planCreditApplication,
  default,
} from '../features/clients/utils/clientCredit.ts';
