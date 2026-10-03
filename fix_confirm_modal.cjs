const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/shared/components/feedback/ConfirmModal.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { SideModal }')) {
  code = `import { SideModal } from '../ui/SideModal';\n` + code;
}

code = code.replace(/<div className="modal-overlay confirm-modal-overlay"[\s\S]*?onClick=\{\(e\) => \{ if \(e\.target === e\.currentTarget\) cancel\(\); \}\}[\s\S]*?style=\{\{ zIndex: 10000 \}\}>[\s\S]*?<div className="modal-content confirm-modal-content" onClick=\{\(e\) => e\.stopPropagation\(\)\}[\s\S]*?style=\{\{ maxWidth: 440, padding: '1\.5rem' \}\}>/g, 
  `<SideModal
      isOpen={true}
      onClose={cancel}
      title={modal.title}
      maxWidthClass="max-w-md"
      actions={
        <div className="flex items-center gap-2">
          <button type="button" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md shadow-sm transition-colors text-sm" onClick={cancel}>
            {secondaryLabel}
          </button>
          <button type="button"
            className={\`px-4 py-2 font-medium rounded-md shadow-sm transition-colors text-sm confirm-modal-primary \${isDanger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}\`}
            onClick={confirm}>
            {primaryLabel}
          </button>
        </div>
      }
    >
      <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">`);

// Replace the old button container at the end
code = code.replace(/<div style=\{\{ display: 'flex', gap: '0\.5rem', justifyContent: 'flex-end', marginTop: '1\.25rem' \}\}>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/, 
  `</div>
    </SideModal>`);

fs.writeFileSync(file, code);
