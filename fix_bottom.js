const fs = require('fs');
let modal = fs.readFileSync('src/components/genealogy/DataImportWizardModal.tsx', 'utf8');

const target =                       <span>{isCommitting ? 'Ðang N?p Vào Supabase...' : \Xác Nh?n & N?p \ Thành Viên\}</span>
                    </button>
                  </div>
                </div>
              </div>
            )};

const replacement =                       <span>{isCommitting ? 'Ðang N?p Vào Supabase...' : \Xác Nh?n & N?p \ Thành Viên\}</span>
                    </button>
                  </div>
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
            )};

modal = modal.replace(target, replacement);
fs.writeFileSync('src/components/genealogy/DataImportWizardModal.tsx', modal);
console.log('Fixed modal bottom');
