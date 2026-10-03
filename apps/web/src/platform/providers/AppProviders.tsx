import React, { ReactNode } from 'react';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { CurrencyProvider } from '@/app/providers/CurrencyProvider';
import { NotificationProvider } from '@/app/providers/NotificationProvider';
import { AntdThemeProvider } from '@/shared/components/ui';

export interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AntdThemeProvider>
        <ProfileProvider>
          <CurrencyProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </CurrencyProvider>
        </ProfileProvider>
      </AntdThemeProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
