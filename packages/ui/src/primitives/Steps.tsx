import React, { ReactNode } from 'react';
import { Steps as AntSteps, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface StepItem {
  key?: string;
  title: ReactNode;
  subTitle?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
}

export interface StepsProps {
  items: StepItem[];
  current: number;
  onChange?: (current: number) => void;
  direction?: 'horizontal' | 'vertical';
  type?: 'default' | 'navigation' | 'inline';
  size?: 'default' | 'small';
  progressDot?: boolean | ((dot: ReactNode, info: { index: number; status: string; title: ReactNode; description: ReactNode }) => ReactNode);
  labelPlacement?: 'horizontal' | 'vertical';
  status?: 'wait' | 'process' | 'finish' | 'error';
  className?: string;
  id?: string;
}

/**
 * Ant Design Navigation System - Steps Component
 * 
 * Spec Rules:
 * - Breaks complex, sequential tasks into explicit workflow stages.
 * - HORIZONTAL: Use for 3-4 stages (more than 2, fewer than 5). Each step title <12 characters.
 * - VERTICAL: Position on the left, usually fixed. Supports multiline stage descriptions and large or dynamic workflows.
 */
export const Steps: React.FC<StepsProps> = ({
  items,
  current,
  onChange,
  direction = 'horizontal',
  type = 'default',
  size = 'default',
  progressDot,
  labelPlacement,
  status,
  className = '',
  id,
}) => {
  const isDark = useIsDarkMode();

  const formattedItems = items.map((step, idx) => ({
    key: step.key || `step-${idx}`,
    title: step.title,
    subTitle: step.subTitle,
    description: step.description,
    icon: step.icon,
    status: step.status,
    disabled: step.disabled,
  }));

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div id={id} className={`ant-steps-container w-full ${className}`.trim()}>
        <AntSteps
          current={current}
          onChange={onChange}
          direction={direction}
          type={type}
          size={size}
          progressDot={progressDot}
          labelPlacement={labelPlacement}
          status={status}
          items={formattedItems}
          className="w-full"
        />
      </div>
    </ConfigProvider>
  );
};

export default Steps;
