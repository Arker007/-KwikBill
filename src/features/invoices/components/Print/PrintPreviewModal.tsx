import React from 'react';
import {
  LiveDocumentPreviewModal,
  LiveDocumentPreviewModalProps,
} from './LiveDocumentPreviewModal';

export type PrintPreviewModalProps = LiveDocumentPreviewModalProps;

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = (props) => {
  return <LiveDocumentPreviewModal {...props} title={props.title || 'Print Preview'} />;
};

export default PrintPreviewModal;
