import React from 'react';
import { ToastContainer } from './Toast';
import { NotificationContainer } from './Notification';
import { ConfirmModalContainer } from './ConfirmModal';
import { FailureDialogContainer } from './FailureDialog';

/**
 * Unified FeedbackContainer mounting:
 * 1. Message/Toast (Top center, lightweight, auto-dismissing ~3s)
 * 2. Notification (Top right, system-initiated global alerts)
 * 3. ConfirmModal (Centered, blocking action confirmations & text prompts)
 * 4. FailureDialog (Persistent, actionable failure dialogs with reason & retry)
 */
export function FeedbackContainer(): React.ReactElement {
  return (
    <>
      <ToastContainer />
      <NotificationContainer />
      <ConfirmModalContainer />
      <FailureDialogContainer />
    </>
  );
}

export default FeedbackContainer;
