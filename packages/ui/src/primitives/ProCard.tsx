import React, {
  forwardRef,
  useState,
  useMemo,
  Children,
  isValidElement,
  ReactNode,
  CSSProperties,
  HTMLAttributes,
} from 'react';
import { ConfigProvider, Tooltip, Tabs as AntTabs, Skeleton, Spin } from 'antd';
import { ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export type ProCardSize = 'default' | 'small';
export type ProCardVariant = 'outlined' | 'borderless';
export type ProCardLayout = 'default' | 'center';
export type ProCardDirection = 'row' | 'column';
export type ProCardSplit = 'vertical' | 'horizontal';
export type ProCardType = 'default' | 'inner';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type Gutter = number | [number, number] | Partial<Record<Breakpoint, number | [number, number]>>;
export type ColSpanType = number | string | Partial<Record<Breakpoint, number | string>>;

export interface ProCardTabItem {
  key: string;
  tab?: ReactNode;
  label?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  cardProps?: Partial<ProCardProps>;
}

export interface ProCardTabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  type?: 'line' | 'card' | 'editable-card';
  onChange?: (activeKey: string) => void;
  items?: ProCardTabItem[];
  tabBarExtraContent?: ReactNode;
  tabPosition?: 'top' | 'left' | 'right' | 'bottom';
  cardProps?: Partial<ProCardProps>;
}

export interface ProCardStyles {
  header?: CSSProperties;
  body?: CSSProperties;
  extra?: CSSProperties;
  title?: CSSProperties;
  actions?: CSSProperties;
}

export interface ProCardClassNames {
  header?: string;
  body?: string;
  extra?: string;
  title?: string;
  actions?: string;
}

export interface ProCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  // Content & Presentation
  title?: ReactNode;
  subTitle?: ReactNode;
  tooltip?: ReactNode | { title: ReactNode };
  extra?: ReactNode;
  cover?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode[] | ReactNode;

  // Appearance
  size?: ProCardSize;
  variant?: ProCardVariant;
  bordered?: boolean; // legacy alias
  type?: ProCardType;
  ghost?: boolean;
  headerBordered?: boolean;
  hoverable?: boolean;
  classNames?: ProCardClassNames;
  styles?: ProCardStyles;

  // Layout & Grid
  layout?: ProCardLayout;
  direction?: ProCardDirection;
  wrap?: boolean;
  colSpan?: ColSpanType;
  colStyle?: CSSProperties;
  gutter?: Gutter;
  split?: ProCardSplit;

  // Behavior & Collapse
  loading?: boolean | ReactNode;
  collapsible?: boolean | 'icon' | 'header';
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  collapsibleIconRender?: (props: { collapsed: boolean }) => ReactNode;

  // Tabs
  tabs?: ProCardTabsProps;

  // Internal marker
  isProCard?: boolean;
}

/**
 * Helper to compute flex style from colSpan (24-column grid or explicit CSS width)
 */
function getColSpanStyle(colSpan?: ColSpanType): CSSProperties {
  if (colSpan === undefined || colSpan === null) return {};

  if (typeof colSpan === 'number') {
    const clamped = Math.max(1, Math.min(24, colSpan));
    const pct = `${(clamped / 24) * 100}%`;
    return {
      flex: `0 0 ${pct}`,
      maxWidth: pct,
      width: pct,
    };
  }

  if (typeof colSpan === 'string') {
    return {
      flex: `0 0 ${colSpan}`,
      maxWidth: colSpan,
      width: colSpan,
    };
  }

  // Breakpoint object: provide default fallback (xs / sm / md / lg / xl)
  if (typeof colSpan === 'object') {
    const defaultSpan = colSpan.lg ?? colSpan.md ?? colSpan.sm ?? colSpan.xs ?? 24;
    return getColSpanStyle(defaultSpan);
  }

  return {};
}

/**
 * Helper to resolve gutter styling
 */
function resolveGutter(gutter?: Gutter): { x: number; y: number } {
  if (!gutter) return { x: 0, y: 0 };
  if (typeof gutter === 'number') return { x: gutter, y: gutter };
  if (Array.isArray(gutter)) return { x: gutter[0] ?? 0, y: gutter[1] ?? 0 };
  if (typeof gutter === 'object') {
    const fallback = gutter.lg ?? gutter.md ?? gutter.sm ?? gutter.xs ?? 0;
    return resolveGutter(fallback);
  }
  return { x: 0, y: 0 };
}

/**
 * Enterprise Ant Design ProCard Component
 * Integrates Card, 24-column Grid, Collapsible sections, Split workspaces, and Tab views.
 */
export const ProCardComponent = forwardRef<HTMLDivElement, ProCardProps>(
  (
    {
      title,
      subTitle,
      tooltip,
      extra,
      cover,
      children,
      actions,
      size = 'default',
      variant = 'outlined',
      bordered,
      type = 'default',
      ghost = false,
      headerBordered = false,
      hoverable = false,
      classNames: customClassNames,
      styles: customStyles,
      layout = 'default',
      direction = 'row',
      wrap = false,
      colSpan,
      colStyle,
      gutter,
      split,
      loading = false,
      collapsible = false,
      collapsed: controlledCollapsed,
      defaultCollapsed = false,
      onCollapse,
      collapsibleIconRender,
      tabs,
      className = '',
      style,
      onClick,
      ...restProps
    },
    ref
  ) => {
    const isDark = useIsDarkMode();

    // Controlled / Uncontrolled collapse state
    const [internalCollapsed, setInternalCollapsed] = useState<boolean>(defaultCollapsed);
    const isControlled = controlledCollapsed !== undefined;
    const isCollapsed = isControlled ? Boolean(controlledCollapsed) : internalCollapsed;

    const handleToggleCollapse = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const next = !isCollapsed;
      if (!isControlled) {
        setInternalCollapsed(next);
      }
      onCollapse?.(next);
    };

    // Analyze children: check if children are ProCards (activates grid container mode)
    const childArray = Children.toArray(children);
    const hasProCardChildren = childArray.some(
      (child) => isValidElement(child) && (child.type as any)?.isProCard
    );

    const isSplit = Boolean(split);
    const splitDirection = split === 'horizontal' ? 'column' : 'row';
    const effectiveDirection = isSplit ? splitDirection : direction;
    const { x: gutterX, y: gutterY } = resolveGutter(gutter);

    // Is card bordered?
    const isBordered = bordered !== undefined ? bordered : variant === 'outlined';

    // Has Header?
    const hasHeader = Boolean(title || subTitle || tooltip || extra || collapsible || tabs);

    // Render tooltip
    const renderTooltip = () => {
      if (!tooltip) return null;
      const tooltipText = typeof tooltip === 'object' && 'title' in (tooltip as any) ? (tooltip as any).title : tooltip;
      return (
        <Tooltip title={tooltipText} placement="top">
          <span className="inline-flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help transition-colors ml-1">
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        </Tooltip>
      );
    };

    // Render Collapse Trigger Icon
    const renderCollapseIcon = () => {
      if (!collapsible) return null;
      if (collapsibleIconRender) {
        return (
          <span onClick={handleToggleCollapse} className="cursor-pointer inline-flex items-center">
            {collapsibleIconRender({ collapsed: isCollapsed })}
          </span>
        );
      }
      return (
        <button
          type="button"
          aria-label={isCollapsed ? 'Expand card' : 'Collapse card'}
          onClick={handleToggleCollapse}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          )}
        </button>
      );
    };

    // Grid sizing from colSpan
    const colSpanStyle = useMemo(() => getColSpanStyle(colSpan), [colSpan]);

    // Outer card container classes
    const containerClasses = [
      'pro-card',
      'relative',
      'box-border',
      'transition-all duration-200',
      ghost
        ? 'bg-transparent border-0 shadow-none'
        : type === 'inner'
        ? 'bg-slate-50/70 dark:bg-slate-900/50 rounded-lg'
        : 'bg-white dark:bg-[#141414] rounded-xl',
      !ghost && isBordered
        ? type === 'inner'
          ? 'border border-slate-200 dark:border-slate-800'
          : 'border border-[#f0f0f0] dark:border-[rgba(253,253,253,0.12)]'
        : 'border-0',
      !ghost && !isBordered && type !== 'inner' ? 'shadow-none' : '',
      !ghost && hoverable ? 'hover-elevation-1 cursor-pointer' : '',
      isSplit ? 'overflow-hidden flex flex-1' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Padding calculations based on size and split mode
    const headerPadding = size === 'small' ? 'px-3 py-2' : headerBordered ? 'px-4 py-3 sm:px-5 sm:py-3.5' : 'px-4 py-2.5 sm:px-5 sm:py-3';
    const bodyPadding = isSplit
      ? 'p-0'
      : ghost
      ? 'p-0'
      : size === 'small'
      ? 'p-3'
      : 'p-4 sm:p-5';

    // Header border style
    const headerBorderClass = headerBordered
      ? 'border-b border-[#f0f0f0] dark:border-[rgba(253,253,253,0.12)] min-h-[48px]'
      : 'min-h-[40px]';

    const isHeaderClickable = collapsible === 'header' || collapsible === true;

    // Body content renderer (loading / tabs / grid / regular)
    const renderBodyContent = () => {
      if (loading) {
        if (typeof loading !== 'boolean') {
          return <div className="py-8 flex items-center justify-center">{loading}</div>;
        }
        return (
          <div className="py-4">
            <Skeleton active paragraph={{ rows: size === 'small' ? 2 : 3 }} />
          </div>
        );
      }

      if (tabs && tabs.items && tabs.items.length > 0) {
        return (
          <AntTabs
            activeKey={tabs.activeKey}
            defaultActiveKey={tabs.defaultActiveKey}
            type={tabs.type || 'line'}
            onChange={tabs.onChange}
            tabPosition={tabs.tabPosition || 'top'}
            tabBarExtraContent={tabs.tabBarExtraContent}
            items={tabs.items.map((item) => ({
              key: item.key,
              label: item.tab || item.label,
              disabled: item.disabled,
              closable: item.closable,
              children: (
                <div className="pt-2">
                  {item.children}
                </div>
              ),
            }))}
            className="pro-card-tabs"
          />
        );
      }

      if (hasProCardChildren || isSplit) {
        return (
          <div
            className={`pro-card-container flex ${effectiveDirection === 'column' ? 'flex-col' : 'flex-row'} ${
              wrap ? 'flex-wrap' : 'flex-nowrap'
            } w-full h-full min-h-0 min-w-0`}
            style={{
              gap: gutterX || gutterY ? `${gutterY}px ${gutterX}px` : undefined,
              ...colStyle,
            }}
          >
            {childArray.map((child, idx) => {
              const isLast = idx === childArray.length - 1;
              const splitDividerClass =
                isSplit && !isLast
                  ? effectiveDirection === 'column'
                    ? 'border-b border-[#f0f0f0] dark:border-[rgba(253,253,253,0.12)]'
                    : 'border-r border-[#f0f0f0] dark:border-[rgba(253,253,253,0.12)]'
                  : '';

              return (
                <div
                  key={isValidElement(child) && child.key ? child.key : idx}
                  className={`pro-card-child-wrapper flex-1 min-w-0 ${splitDividerClass}`}
                >
                  {child}
                </div>
              );
            })}
          </div>
        );
      }

      return children;
    };

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div
          ref={ref}
          className={containerClasses}
          style={{
            ...colSpanStyle,
            ...style,
          }}
          onClick={onClick}
          {...restProps}
        >
          {/* Cover image / graphic */}
          {cover && <div className="pro-card-cover overflow-hidden rounded-t-xl">{cover}</div>}

          {/* Header */}
          {hasHeader && (
            <div
              className={`pro-card-header flex items-center justify-between gap-3 ${headerPadding} ${headerBorderClass} ${
                isHeaderClickable ? 'cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-900/30' : ''
              } ${customClassNames?.header || ''}`}
              style={customStyles?.header}
              onClick={isHeaderClickable ? handleToggleCollapse : undefined}
            >
              {/* Title, Subtitle, Tooltip & Collapse Toggle */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {collapsible && renderCollapseIcon()}

                {title && (
                  <div
                    className={`pro-card-title text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5 min-w-0 ${
                      customClassNames?.title || ''
                    }`}
                    style={customStyles?.title}
                  >
                    <span className="truncate">{title}</span>
                    {renderTooltip()}
                  </div>
                )}

                {subTitle && (
                  <span className="pro-card-subtitle text-xs text-slate-500 dark:text-slate-400 font-normal truncate">
                    {subTitle}
                  </span>
                )}
              </div>

              {/* Extra actions in header */}
              {extra && (
                <div
                  className={`pro-card-extra flex items-center gap-2 shrink-0 ${customClassNames?.extra || ''}`}
                  style={customStyles?.extra}
                  onClick={(e) => e.stopPropagation()}
                >
                  {extra}
                </div>
              )}
            </div>
          )}

          {/* Collapsible Body Wrapper */}
          <div
            className={`pro-card-body-wrapper transition-all duration-200 overflow-hidden ${
              isCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-none opacity-100'
            }`}
          >
            <div
              className={`pro-card-body ${bodyPadding} ${
                layout === 'center' ? 'flex flex-col items-center justify-center text-center' : ''
              } ${customClassNames?.body || ''}`}
              style={customStyles?.body}
            >
              {renderBodyContent()}
            </div>

            {/* Bottom Actions Bar */}
            {actions && (
              <div
                className={`pro-card-actions bg-slate-50/80 dark:bg-[#1f1f1f]/80 border-t border-[#f0f0f0] dark:border-[rgba(253,253,253,0.12)] px-4 py-2.5 flex items-center justify-end gap-2 ${
                  customClassNames?.actions || ''
                }`}
                style={customStyles?.actions}
              >
                {Array.isArray(actions)
                  ? actions.map((action, i) => (
                      <React.Fragment key={i}>{action}</React.Fragment>
                    ))
                  : actions}
              </div>
            )}
          </div>
        </div>
      </ConfigProvider>
    );
  }
);

ProCardComponent.displayName = 'ProCard';

// Static ProCard identifier for parent flex detection
(ProCardComponent as any).isProCard = true;

/**
 * ProCard.Group Component for grouped multi-card compositions
 */
export interface ProCardGroupProps extends ProCardProps {
  title?: ReactNode;
  extra?: ReactNode;
}

const ProCardGroup: React.FC<ProCardGroupProps> = ({
  children,
  split = 'vertical',
  direction = 'row',
  ghost = false,
  className = '',
  ...props
}) => {
  return (
    <ProCardComponent
      split={split}
      direction={direction}
      ghost={ghost}
      className={`pro-card-group ${className}`}
      {...props}
    >
      {children}
    </ProCardComponent>
  );
};
ProCardGroup.displayName = 'ProCard.Group';
(ProCardGroup as any).isProCard = true;

/**
 * ProCard.Divider Component
 */
export interface ProCardDividerProps {
  type?: 'horizontal' | 'vertical';
  orientation?: 'horizontal' | 'vertical';
  dashed?: boolean;
  style?: CSSProperties;
  className?: string;
}

const ProCardDivider: React.FC<ProCardDividerProps> = ({
  type,
  orientation = 'vertical',
  dashed = false,
  style,
  className = '',
}) => {
  const dir = type || orientation;
  return (
    <div
      className={`pro-card-divider shrink-0 ${
        dir === 'horizontal'
          ? `w-full my-3 border-b ${dashed ? 'border-dashed' : 'border-solid'} border-[#f0f0f0] dark:border-[rgba(253,253,253,0.12)]`
          : `h-full mx-3 border-r ${dashed ? 'border-dashed' : 'border-solid'} border-[#f0f0f0] dark:border-[rgba(253,253,253,0.12)]`
      } ${className}`}
      style={style}
    />
  );
};
ProCardDivider.displayName = 'ProCard.Divider';
(ProCardDivider as any).isProCard = true;

/**
 * ProCard.TabPane (legacy / declarative tab definition)
 */
export interface ProCardTabPaneProps {
  key: string;
  tab?: ReactNode;
  disabled?: boolean;
  cardProps?: Partial<ProCardProps>;
  children?: ReactNode;
}

const ProCardTabPane: React.FC<ProCardTabPaneProps> = ({ children }) => {
  return <>{children}</>;
};
ProCardTabPane.displayName = 'ProCard.TabPane';
(ProCardTabPane as any).isProCard = true;

/**
 * Attach subcomponents to ProCard
 */
export type ProCardTypeWithStatics = typeof ProCardComponent & {
  Group: typeof ProCardGroup;
  Divider: typeof ProCardDivider;
  TabPane: typeof ProCardTabPane;
  isProCard: boolean;
};

export const ProCard = ProCardComponent as ProCardTypeWithStatics;
ProCard.Group = ProCardGroup;
ProCard.Divider = ProCardDivider;
ProCard.TabPane = ProCardTabPane;
ProCard.isProCard = true;

export default ProCard;
