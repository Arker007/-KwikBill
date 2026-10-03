import React, { ReactNode } from 'react';
import { Empty as AntEmpty, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'No Data Found',
  description = 'There are no records to display at this time.',
  action,
  className = '',
}) => {
  const isDark = useIsDarkMode();

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div className={`p-8 text-center bg-white dark:bg-[#141414] border border-[#d9d9d9] dark:border-[#303030] rounded-xl ${className}`.trim()}>
        <AntEmpty
          image={icon ? <div>{icon}</div> : AntEmpty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="flex flex-col items-center">
              {title && (
                <span className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  {title}
                </span>
              )}
              {description && (
                <span className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  {description}
                </span>
              )}
            </div>
          }
        >
          {action && <div className="mt-3">{action}</div>}
        </AntEmpty>
      </div>
    </ConfigProvider>
  );
};

export default EmptyState;
