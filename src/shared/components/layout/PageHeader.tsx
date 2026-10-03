import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Tooltip } from 'antd';
import { Breadcrumb, type BreadcrumbItem as UiBreadcrumbItem } from '../ui/Breadcrumb';

export interface PageHeaderBreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface PageHeaderProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  breadcrumbs?: PageHeaderBreadcrumbItem[];
  onBack?: () => void;
  backTooltip?: string;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Ant Design Standardized Page Header Component
 *
 * Implements In-Page and Back Navigation Patterns:
 * 1. Declares page theme, hierarchy, and context.
 * 2. Breadcrumbs: Reflects position in website structure for multi-level navigation.
 * 3. Back Button: Provides return navigation for drill-down and subsite workflows.
 * 4. Page-level Actions: Houses contextual operations separated from global utility tools.
 */
export default function PageHeader({
  icon,
  title,
  subtitle,
  meta,
  breadcrumbs,
  onBack,
  backTooltip = 'Back to previous page',
  children,
  extra,
  actions,
}: PageHeaderProps): React.ReactElement {
  const effectiveActions = actions || extra || children;

  const breadcrumbItems: UiBreadcrumbItem[] | undefined = breadcrumbs?.map((crumb, idx) => ({
    key: `crumb-${idx}`,
    title: crumb.label,
    onClick: crumb.onClick,
    className: idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-800 dark:text-slate-200' : undefined,
  }));

  return (
    <div className="page-header ant-page-header bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.12)] rounded-[8px] px-5 py-4 mb-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex flex-col gap-2.5">
      {/* Breadcrumbs Navigation Row */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} maxCount={5} className="mb-0.5" />
      )}

      {/* Main Header Content Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 w-full">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {/* Back Navigation Button */}
          {onBack && (
            <Tooltip title={backTooltip} placement="bottom" mouseEnterDelay={0.3}>
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="w-8 h-8 rounded-md border border-slate-200 dark:border-[#303030] hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              >
                <ArrowLeft size={16} />
              </button>
            </Tooltip>
          )}

          {icon !== undefined && (
            <div className="w-10 h-10 rounded-[6px] bg-[#e6f4ff] dark:bg-[rgba(22,119,255,0.18)] text-[#1677ff] dark:text-[#69b1ff] flex items-center justify-center text-lg shrink-0 border border-[#91caff] dark:border-[rgba(22,119,255,0.35)] mt-0.5 sm:mt-0">
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-[#141414] dark:text-[#ffffff] tracking-tight m-0 leading-tight">
              {title}
            </h1>
            {(subtitle || meta) && (
              <div className="text-xs text-[#595959] dark:text-[rgba(255,255,255,0.65)] mt-1 flex items-center gap-2 flex-wrap">
                {subtitle && <span>{subtitle}</span>}
                {meta && (
                  <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#fafafa] dark:bg-[rgba(255,255,255,0.08)] border border-[#d9d9d9] dark:border-[rgba(255,255,255,0.15)] font-medium text-[#262626] dark:text-[#ffffff]">
                    {meta}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {effectiveActions && (
          <div className="flex items-center gap-2 flex-wrap lg:justify-end shrink-0 pt-1 lg:pt-0">
            {effectiveActions}
          </div>
        )}
      </div>
    </div>
  );
}
