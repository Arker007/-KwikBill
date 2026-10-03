import React from 'react';
import { Lock } from 'lucide-react';

export interface SwipeSettingsFooterProps {
  className?: string;
}

export const SwipeSettingsFooter: React.FC<SwipeSettingsFooterProps> = ({ className = '' }) => {
  return (
    <footer
      id="swipe-global-footer"
      className={`bg-white border-t border-gray-200 py-3.5 px-6 select-none relative z-20 ${className}`.trim()}
    >
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        {/* Logo + Copyright + Security Badge */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* KwikBill Logo Small */}
          <div className="flex items-center space-x-1.5">
            <div className="w-5 h-5 bg-gradient-to-tr from-[#1665D8] to-[#2563EB] rounded-md flex items-center justify-center text-white font-black text-[11px]">
              K
            </div>
            <span className="text-sm font-extrabold tracking-tight text-gray-900">
              Kwik<span className="text-[#1665D8]">Bill</span>
            </span>
          </div>

          <span className="text-gray-500 text-[11px]">
            ©2026 NextSpeed Technologies Private Limited. All rights reserved.
          </span>

          {/* Security Assurance */}
          <div className="flex items-center space-x-1 text-[11px] text-[#1E61EB] pl-1 sm:pl-2">
            <Lock className="w-3 h-3 text-[#1E61EB]" />
            <span>Data is secured via &apos;bank-grade&apos; security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SwipeSettingsFooter;
