import React from 'react';

export interface AddressCardProps {
  id?: string;
  type: 'billing' | 'shipping';
  title?: string;
  name?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopyToShipping?: () => void;
  onSetDefault?: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  id,
  type,
  title,
  name,
  line1,
  line2,
  city,
  state,
  stateCode,
  pincode,
  country = 'India',
  isDefault = false,
  onEdit,
  onDelete,
  onCopyToShipping,
  onSetDefault,
}) => {
  const isBilling = type === 'billing';

  const formattedStatePin = [
    stateCode || '',
    state ? state.toUpperCase() : '',
    pincode || '',
  ]
    .filter(Boolean)
    .join('-');

  return (
    <div
      id={id ? `address-card-${id}` : undefined}
      className={`rounded-lg p-3.5 text-xs leading-relaxed text-gray-800 shadow-2xs border ${
        isBilling
          ? 'w-full max-w-sm bg-[#FDF2F4] border-pink-100 mb-3'
          : 'bg-[#EEF0FD] border-indigo-50'
      }`}
    >
      {(title || name) && (
        <p className="font-normal text-gray-700">{title || name}</p>
      )}
      {line1 && <p className="font-normal text-gray-700">{line1}</p>}
      {line2 && <p className="font-normal text-gray-700">{line2}</p>}
      {city && <p className="font-normal text-gray-700">{city}</p>}
      {formattedStatePin && (
        <p className="font-normal text-gray-700">{formattedStatePin}</p>
      )}
      {country && <p className="font-normal text-gray-700 mb-3">{country}</p>}

      <div className="flex items-center space-x-2 text-[11px] pt-1">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[#1E61EB] font-medium hover:underline"
          >
            Edit
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-red-500 font-medium hover:underline"
          >
            Delete
          </button>
        )}

        {isBilling && onCopyToShipping && (
          <button
            type="button"
            onClick={onCopyToShipping}
            className="text-emerald-600 font-medium hover:underline"
          >
            Copy to Shipping
          </button>
        )}

        {isBilling && (
          <div className="ml-auto">
            {isDefault ? (
              <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                Default
              </span>
            ) : onSetDefault ? (
              <button
                type="button"
                onClick={onSetDefault}
                className="text-gray-600 font-normal hover:underline"
              >
                Set as Default
              </button>
            ) : (
              <span className="text-gray-600 font-normal">Set as Default</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
