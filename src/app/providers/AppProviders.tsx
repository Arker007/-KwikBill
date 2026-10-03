import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ProfileProvider } from './ProfileProvider';
import { CurrencyProvider } from './CurrencyProvider';
import { NotificationProvider } from './NotificationProvider';
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
