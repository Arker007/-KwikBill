import React from 'react';
import { Building2 } from 'lucide-react';
import { confirmAction } from './ConfirmModal';
import { toast } from './Toast';
import { AlertBanner } from './AlertBanner';

export interface UnassignedBannerProps {
  count: number;
  businessName: string;
  noun: string;
  onAssign: () => Promise<void> | void;
}

export default function UnassignedBanner({ count, businessName, noun, onAssign }: UnassignedBannerProps) {
  if (!count || !businessName) return null;

  const label = count === 1 ? `1 ${noun}` : `${count} ${noun}s`;

  const handleClick = async () => {
    const ok = await confirmAction({
      title: `Assign ${label} to ${businessName}?`,
      message:
        `${label} ${count === 1 ? 'was' : 'were'} saved before you began keeping `
        + `businesses separate, so ${count === 1 ? 'it appears' : 'they appear'} under every business. `
        + `Assigning ${count === 1 ? 'it' : 'them'} to ${businessName} means `
        + `${count === 1 ? 'it' : 'they'} will no longer show under your other businesses. `
        + `Only do this if ${count === 1 ? 'it belongs' : 'they belong'} to ${businessName}.`,
      confirmLabel: `Assign to ${businessName}`,
    });
    if (!ok) return;
    try {
      await onAssign();
      toast(`${label} assigned to ${businessName}`, 'success');
    } catch {
      toast('Could not assign — please try again', 'error');
    }
  };

  return (
    <AlertBanner
      type="info"
      icon={<Building2 size={18} />}
      title={`${label} saved before multi-business mode`}
      description="These items carry no assigned business profile and appear across all business views. Assign them to keep your business records separate."
      actionLabel={`Assign to ${businessName}`}
      onAction={handleClick}
      className="mb-4"
    />
  );
}
