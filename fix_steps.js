const fs = require('fs');
let content = fs.readFileSync('src/components/genealogy/DataImportWizardModal.tsx', 'utf-8');

// 1. Rename combined step 3 & 4 block
content = content.replace(
  /\{\/\* STEP 3 & 4: Validation Summary & Preview \*\/\}\s*\{\(step === 3 \|\| step === 4\) && validation && \(/,
  \{/* STEP 3: Validation Summary */}
          {step === 3 && validation && (\
);

// 2. Split at table filter toggle
const tableToggleMarker = '{/* Table filter toggle */}';
const splitIndex = content.indexOf(tableToggleMarker);

if (splitIndex !== -1) {
  const step3Footer = \
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setStep(2)} 
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer text-xs"
                >
                  ? Ghép C?t
                </button>
                <button 
                  onClick={() => setStep(4)} 
                  className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl inline-flex items-center space-x-1.5 shadow-md transition cursor-pointer"
                >
                  <span>Chuy?n Sang Bu?c 4: Xem Tru?c</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Preview */}
          {step === 4 && validation && (
            <div className="space-y-4">
              \;

  content = content.substring(0, splitIndex) + step3Footer + content.substring(splitIndex);
}

// 3. Fix step 4 footer back button
content = content.replace(
  /onClick=\{\(\) => setStep\(2\)\}\s*className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer text-xs"\s*>\s*? Ghép C?t/g,
  \onClick={() => setStep(3)} 
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer text-xs"
                >
                  ? Quét L?i\
);

fs.writeFileSync('src/components/genealogy/DataImportWizardModal.tsx', content);
console.log('Fixed steps');
