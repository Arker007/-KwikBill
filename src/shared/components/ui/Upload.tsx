import React, { useId } from 'react';
import { Upload as AntUpload, Button, ConfigProvider } from 'antd';
import { Upload as UploadIcon, FileText, X } from 'lucide-react';
import type { UploadProps as AntUploadProps } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface UploadProps {
  accept?: string;
  multiple?: boolean;
  onChange?: (files: FileList | null) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  dragger?: boolean;
  value?: File[] | null;
  onRemove?: (index: number) => void;
  containerClassName?: string;
  disabled?: boolean;
}

export const Upload: React.FC<UploadProps> = ({
  accept,
  multiple = false,
  onChange,
  label,
  hint = 'Click or drag file to this area to upload',
  dragger = false,
  value,
  onRemove,
  containerClassName = '',
  disabled = false,
}) => {
  const isDark = useIsDarkMode();
  const generatedId = useId();
  const uploadId = `upload-${generatedId}`;

  const customRequest: AntUploadProps['customRequest'] = (options) => {
    // Prevent default upload request, pass file to onChange
    if (options.file && onChange) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(options.file as File);
      onChange(dataTransfer.files);
    }
    options.onSuccess?.('ok');
  };

  const handleBeforeUpload: AntUploadProps['beforeUpload'] = (_, fileList) => {
    if (onChange) {
      const dataTransfer = new DataTransfer();
      fileList.forEach((f) => dataTransfer.items.add(f));
      onChange(dataTransfer.files);
    }
    return false; // Prevent automatic upload
  };

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div className={`form-group w-full ${containerClassName}`.trim()}>
        {label && (
          <label htmlFor={uploadId} className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {label}
          </label>
        )}

        {dragger ? (
          <AntUpload.Dragger
            id={uploadId}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            beforeUpload={handleBeforeUpload}
            customRequest={customRequest}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon flex justify-center text-[#1677ff] mb-2">
              <UploadIcon size={24} />
            </p>
            <p className="ant-upload-text text-sm font-medium">{hint}</p>
            {accept && (
              <p className="ant-upload-hint text-xs text-slate-400 mt-1">
                Supported formats: {accept}
              </p>
            )}
          </AntUpload.Dragger>
        ) : (
          <AntUpload
            id={uploadId}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            beforeUpload={handleBeforeUpload}
            customRequest={customRequest}
            showUploadList={false}
          >
            <Button icon={<UploadIcon size={14} className="text-[#1677ff]" />} disabled={disabled}>
              Upload File
            </Button>
          </AntUpload>
        )}

        {value && value.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-1.5">
            {value.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between px-3 py-1.5 rounded-[4px] bg-[#fafafa] dark:bg-[#1f1f1f] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.1)] text-xs text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-[#1677ff] shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-slate-400 text-[10px]">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="p-1 hover:text-red-500 text-slate-400 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default Upload;
