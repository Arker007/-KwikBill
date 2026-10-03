import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Edit, Copy, Trash2, PackagePlus } from 'lucide-react';
import { Tooltip } from 'antd';
import { Product } from '../types';

export interface ProductActionMenuProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
}

export const ProductActionMenu: React.FC<ProductActionMenuProps> = ({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  onAdjustStock,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If close to bottom of screen (< 180px), open upwards
      if (spaceBelow < 180) {
        setCoords({
          top: Math.max(12, rect.top - 160),
          right: Math.max(12, window.innerWidth - rect.right),
        });
      } else {
        setCoords({
          top: rect.bottom + 4,
          right: Math.max(12, window.innerWidth - rect.right),
        });
      }
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleClose = () => setOpen(false);
    window.addEventListener('resize', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [open]);

  return (
    <div className="relative inline-flex items-center">
      <Tooltip title="More actions" placement="left" mouseEnterDelay={0.3}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleOpen}
          className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#8c8c8c] hover:text-[#141414] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#262626] transition-colors cursor-pointer"
          aria-label="More options"
        >
          <MoreHorizontal size={16} />
        </button>
      </Tooltip>

      {open &&
        coords &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            />
            <div
              className="fixed w-44 bg-white dark:bg-[#1f1f1f] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.12)] rounded-[8px] shadow-[0_6px_16px_0_rgba(0,0,0,0.12)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
              style={{
                top: `${coords.top}px`,
                right: `${coords.right}px`,
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onEdit(product);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#262626] dark:text-[rgba(255,255,255,0.85)] hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] transition-colors text-left cursor-pointer"
              >
                <Edit size={13} className="text-[#1677ff]" />
                Edit Item
              </button>
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onDuplicate(product);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#262626] dark:text-[rgba(255,255,255,0.85)] hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] transition-colors text-left cursor-pointer"
                >
                  <Copy size={13} className="text-[#722ed1]" />
                  Duplicate
                </button>
              )}
              {onAdjustStock && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onAdjustStock(product);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#262626] dark:text-[rgba(255,255,255,0.85)] hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] transition-colors text-left cursor-pointer"
                >
                  <PackagePlus size={13} className="text-[#52c41a]" />
                  Adjust Stock
                </button>
              )}
              {product.id && (
                <>
                  <div className="h-px bg-[#f0f0f0] dark:bg-[rgba(255,255,255,0.1)] my-1" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      onDelete(product.id!);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#ff4d4f] hover:bg-[#fff2f0] dark:hover:bg-[rgba(255,77,79,0.15)] transition-colors text-left cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Delete Item
                  </button>
                </>
              )}
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
