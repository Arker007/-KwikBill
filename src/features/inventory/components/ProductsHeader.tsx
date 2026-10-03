import React from 'react';
import { PlayCircle, ChevronRight } from 'lucide-react';
import { Tooltip } from 'antd';

export interface ProductsHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    items?: number;
    categories?: number;
    groups?: number;
    priceLists?: number;
    deleted?: number;
  };
  onNavigateHome?: () => void;
}

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  activeTab,
  onTabChange,
  counts = {},
  onNavigateHome,
}) => {
  const tabs = [
    { id: 'items', label: 'Items', count: counts.items },
    { id: 'categories', label: 'Categories', count: counts.categories },
    { id: 'groups', label: 'Groups', count: counts.groups },
    { id: 'price-lists', label: 'Price Lists', count: counts.priceLists },
    { id: 'deleted', label: 'Deleted', count: counts.deleted },
  ];

  return (
    <div className="border-b border-[#f0f0f0] dark:border-[rgba(255,255,255,0.12)] bg-white dark:bg-[#141414] px-6 pt-4 pb-0 rounded-t-[12px] shadow-sm mb-4">
      {/* Breadcrumb Path */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
        <button
          type="button"
          onClick={onNavigateHome}
          className="hover:text-[#1677ff] dark:hover:text-[#4096ff] transition-colors cursor-pointer font-medium p-0 bg-transparent border-0 text-slate-500 dark:text-slate-400"
        >
          Master Records
        </button>
        <ChevronRight size={12} className="text-slate-400 dark:text-slate-600 shrink-0" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Products & Services</span>
      </nav>

      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold tracking-tight text-[#141414] dark:text-[#f0f0f0] m-0">
          Products & Services
        </h1>
        <Tooltip title="Watch Quick Video Guide" placement="right" mouseEnterDelay={0.3}>
          <button
            type="button"
            className="inline-flex items-center justify-center text-[#eb2f96] hover:text-[#c41d7f] dark:text-[#ff85c0] transition-transform hover:scale-110 p-0.5 cursor-pointer"
            aria-label="Watch tutorial guide"
          >
            <PlayCircle size={20} className="fill-[#fff0f6] dark:fill-[rgba(235,47,150,0.2)]" />
          </button>
        </Tooltip>
      </div>

      {/* Tabs (Lateral Navigation) */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pb-3.5 text-sm font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-[#1677ff] dark:text-[#69b1ff] font-semibold'
                  : 'text-[#595959] dark:text-[rgba(255,255,255,0.65)] hover:text-[#141414] dark:hover:text-[#ffffff]'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-[#e6f4ff] text-[#1677ff] dark:bg-[rgba(22,119,255,0.2)] dark:text-[#69b1ff]'
                      : 'bg-[#f5f5f5] text-[#8c8c8c] dark:bg-[#262626] dark:text-[#8c8c8c]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1677ff] rounded-t-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
