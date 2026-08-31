const fs = require('fs');
let code = fs.readFileSync('src/components/genealogy/DataImportWizardModal.tsx', 'utf-8');

const splitMarker = '{/* Filter Tabs & Preview Bar */}';
const splitIndex = code.indexOf(splitMarker);

if (splitIndex === -1) {
  console.log('Error: splitMarker not found');
  process.exit(1);
}

const part1 = code.substring(0, splitIndex);
const part2 = code.substring(splitIndex);

const step3Footer = [
  '              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">',
  '                <button onClick={() => setStep(2)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer text-xs">',
  '                  ← Quay Lại Bước 2',
  '                </button>',
  '                <button onClick={() => setStep(4)} className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl shadow-md transition inline-flex items-center space-x-1.5 cursor-pointer text-xs">',
  '                  <span>Chuyển Sang Bước 4: Xem Trước Dữ Liệu</span>',
  '                </button>',
  '              </div>',
  '            </div>',
  '          )}',
  '',
  '          {/* STEP 4: Xem Trước & Xác Nhận */}',
  '          {step === 4 && validation && (',
  '            <div className="space-y-4">',
  '              '
].join('\n');

let newPart2 = part2.replace(
  /onClick=\{\(\) => setStep\(2\)\}\s*className="[^"]*"\s*>\s*← Ghép Cột/g,
  'onClick={() => setStep(3)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer text-xs">← Quay Lại Bước 3'
);

let newPart1 = part1.replace('{/* STEP 3: Quét Lỗi Logic, Chỉnh Sửa Trực Tiếp & Xem Trước */}', '{/* STEP 3: Quét Lỗi Logic & Chỉnh Sửa */}');
newPart1 = newPart1.replace('{step === 3 && validation && (', '{step === 3 && validation && (');

fs.writeFileSync('src/components/genealogy/DataImportWizardModal.tsx', newPart1 + step3Footer + newPart2);
console.log('Successfully split Step 3 and 4!');
