const fs = require('fs');
let text = fs.readFileSync('src/components/genealogy/DataImportWizardModal.tsx', 'utf8');

// Replace the first match only
let replaced = false;
text = text.replace(
  /                  <\/div>\s*<\/div>\s*<\/div>\s*\)\}/g,
  (match) => {
    if (replaced) return match;
    replaced = true;
    return `                  </div>
                </div>
                {parseError && (
                  <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl flex items-start gap-2 text-xs font-medium">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold mb-1">L?i khi n?p d? li?u:</p>
                      <p className="break-all">{parseError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}`;
  }
);

text = text.replace(
  /                \{parseError && \(\s*<div className="p-3\.5 bg-rose-50[^>]+>\s*<XCircle[^>]+>\s*<span[^>]*>\{parseError\}<\/span>\s*<\/div>\s*\)\}\s*/g,
  ''
);

fs.writeFileSync('src/components/genealogy/DataImportWizardModal.tsx', text);
console.log('Done');
