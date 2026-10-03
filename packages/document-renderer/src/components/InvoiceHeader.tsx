import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { InvoiceViewModel } from '../domain/createInvoiceViewModel';

interface Props {
  vm: InvoiceViewModel;
  styles: any;
}

export const InvoiceHeader: React.FC<Props> = ({ vm, styles }) => {
  const { profile, customTitle, showLogo, showBusinessName, showBusinessAddress, showBusinessPhone, showBusinessEmail, showGSTIN, taxLabel } = vm;

  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{customTitle}</Text>
        {showBusinessName && (
          <Text style={styles.businessName}>{profile?.businessName || 'Business Name'}</Text>
        )}
        {showBusinessAddress && profile?.address && (
          <Text style={styles.businessDetail}>
            {[profile.address, profile.city, profile.state, profile.pin].filter(Boolean).join(', ')}
          </Text>
        )}
        {(showBusinessPhone && profile?.phone) || (showBusinessEmail && profile?.email) ? (
          <Text style={styles.businessDetail}>
            {[showBusinessPhone && profile.phone, showBusinessEmail && profile.email].filter(Boolean).join(' | ')}
          </Text>
        ) : null}
        {showGSTIN && profile?.gstin && (
          <Text style={styles.businessDetail}>{taxLabel}IN: {profile.gstin}</Text>
        )}
      </View>

      {showLogo && profile?.logo && (
        <Image src={profile.logo} style={{ width: 64, height: 64, objectFit: 'contain' }} />
      )}
    </View>
  );
};
