const fs = require('fs');
const file = 'src/features/invoices/components/Print/PrintPreviewModal.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/SideModal>/, '</div>\n      </div>\n    </SideModal>');
fs.writeFileSync(file, content);
