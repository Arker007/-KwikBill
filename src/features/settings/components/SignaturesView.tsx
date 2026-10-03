import React, { useRef } from 'react';
import { PenTool, Upload, Trash2, Check, FileText } from 'lucide-react';
import { BusinessProfileData } from '../types';
import { toast } from '../../../shared/components/feedback/Toast';
import { Slider } from '@/shared/components/ui';

export interface SignaturesViewProps {
  profile: BusinessProfileData;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfileData>>;
  onSaveProfile: (profile: BusinessProfileData) => Promise<void>;
  handleImageUpload: (field: 'logo' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (field: 'logo' | 'signature') => void;
}

export const SignaturesView: React.FC<SignaturesViewProps> = ({
  profile,
  setProfile,
  onSaveProfile,
  handleImageUpload,
  removeImage,
}) => {
  const sigInputRef = useRef<HTMLInputElement>(null);

  return (
    <div id="signatures-tab-content" className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Signatures & Letterhead</h2>
          <p className="text-xs text-gray-500 mt-1">
            Upload authorized digital signature and calibrate logo sizing for invoice PDFs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Digital Signature Card */}
        <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <PenTool className="w-4 h-4 text-[#1E61EB]" />
            <h3 className="text-xs font-bold text-gray-900">Authorized Signatory</h3>
          </div>
          <p className="text-[11px] text-gray-500">
            This signature will appear on printed and exported invoice PDFs at the bottom-right corner.
          </p>

          <input
            ref={sigInputRef}
            type="file"
            accept="image/*,.svg"
            onChange={e => handleImageUpload('signature', e)}
            className="hidden"
          />

          {profile.signature ? (
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50 text-center relative group">
              <img
                src={profile.signature}
                alt="Authorized Signature"
                className="max-h-24 mx-auto object-contain"
              />
              <div className="mt-3 flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => sigInputRef.current?.click()}
                  className="text-xs text-[#1E61EB] font-medium hover:underline"
                >
                  Replace Signature
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => removeImage('signature')}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => sigInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-[#1E61EB] rounded-lg p-6 text-center cursor-pointer transition-colors bg-gray-50/50"
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">Click to upload signature</p>
              <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, or SVG with transparent background</p>
            </div>
          )}
        </div>

        {/* Logo Calibration Card */}
        <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#1E61EB]" />
            <h3 className="text-xs font-bold text-gray-900">Logo Print Size</h3>
          </div>
          <p className="text-[11px] text-gray-500">
            Adjust how large your brand logo renders in printed documents.
          </p>

          <div>
            <Slider
              label="Height on PDF:"
              min={24}
              max={120}
              step={4}
              value={profile.logoHeight || 48}
              onChange={(e: any) => {
                const val = typeof e === 'number' ? e : parseInt(e?.target?.value || '48', 10);
                setProfile({ ...profile, logoHeight: val });
              }}
              showValueBadge={false}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
              <span>Small (24px)</span>
              <span>Standard (48px)</span>
              <span>Large (120px)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
            <button
              type="button"
              onClick={async () => {
                await onSaveProfile(profile);
                toast('Signature & logo settings saved!', 'success');
              }}
              className="bg-[#1E61EB] hover:bg-[#174ec4] text-white font-medium text-xs py-2 px-4 rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturesView;
