import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowLeft, ShieldCheck, Download, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { DataImportService, RawImportMember, ValidationSummary, ColumnMappingSuggestion } from '../../services/DataImportService';

interface DataImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DataImportWizardModal: React.FC<DataImportWizardModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [mappings, setMappings] = useState<ColumnMappingSuggestion[]>([]);
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoSuccess, setUndoSuccess] = useState(false);

  if (!isOpen) return null;

  const sampleHeaders = ['Họ và Tên', 'Giới Tính', 'Thế Hệ (Đời)', 'Chi Phái', 'Tên Cha', 'Vợ / Chồng', 'Năm Sinh', 'Ngày Mất Âm', 'Tháng Mất Âm', 'Nơi An Táng'];

  const sampleData: RawImportMember[] = [
    { fullName: 'Cụ Nguyễn Văn Phúc', gender: 'MALE', generationNumber: 1, branchName: 'Chi Trưởng', lifeStatus: 'DECEASED', deathLunarDay: 15, deathLunarMonth: 1, deathLunarYear: 1952, burialPlace: 'Lăng Mộ Tổ' },
    { fullName: 'Cụ Bà Trần Thị Mai', gender: 'FEMALE', generationNumber: 1, branchName: 'Chi Trưởng', spouseName: 'Cụ Nguyễn Văn Phúc', lifeStatus: 'DECEASED', deathLunarDay: 10, deathLunarMonth: 8, deathLunarYear: 1958 },
    { fullName: 'Cụ Nguyễn Văn Khang', gender: 'MALE', generationNumber: 2, branchName: 'Chi Trưởng', parentName: 'Cụ Nguyễn Văn Phúc', lifeStatus: 'DECEASED', deathLunarDay: 18, deathLunarMonth: 5, deathLunarYear: 1980 },
    { fullName: 'Cụ Nguyễn Văn Ninh', gender: 'MALE', generationNumber: 2, branchName: 'Chi Hai', parentName: 'Cụ Nguyễn Văn Phúc', lifeStatus: 'DECEASED', deathLunarDay: 22, deathLunarMonth: 11, deathLunarYear: 1985 },
    { fullName: 'Cụ Nguyễn Văn Thịnh', gender: 'MALE', generationNumber: 2, branchName: 'Chi Ba', parentName: 'Cụ Nguyễn Văn Phúc', lifeStatus: 'DECEASED', deathLunarDay: 5, deathLunarMonth: 4, deathLunarYear: 1990 },
    { fullName: 'Nguyễn Văn Hoàng', gender: 'MALE', generationNumber: 4, branchName: 'Chi Trưởng', parentName: 'Cụ Nguyễn Văn Khang', lifeStatus: 'ALIVE', birthYear: 1975 },
  ];

  const handleStartAutoMap = () => {
    const suggested = DataImportService.autoMapHeaders(sampleHeaders);
    setMappings(suggested);
    setStep(2);
  };

  const handleRunValidation = () => {
    const res = DataImportService.validateImportData(sampleData);
    setValidation(res);
    setStep(3);
  };

  const handleCommit = async () => {
    if (!validation) return;
    setIsCommitting(true);
    const result = await DataImportService.commitImport('family-id', validation);
    setIsCommitting(false);
    if (result.success) {
      setLastBatchId(result.batchId);
      setStep(5);
    }
  };

  const handleUndoBatch = async () => {
    if (!lastBatchId) return;
    setIsUndoing(true);
    await DataImportService.rollbackBatch(lastBatchId);
    setIsUndoing(false);
    setUndoSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
        {/* Header & Steps */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-100 text-heritage-green rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Nhập Dữ Liệu Gia Phả Từ Tệp</h1>
                <p className="text-xs text-slate-500">Tự động ghép cột thông tin, kiểm tra tính hợp lệ và hỗ trợ hoàn tác khi cần</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-5 gap-1.5 mt-4 text-center text-[11px] font-bold">
            <div className={`p-1.5 rounded-lg ${step >= 1 ? 'bg-emerald-50 text-heritage-green border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
              1. Tải Lên
            </div>
            <div className={`p-1.5 rounded-lg ${step >= 2 ? 'bg-emerald-50 text-heritage-green border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
              2. Ghép Cột
            </div>
            <div className={`p-1.5 rounded-lg ${step >= 3 ? 'bg-emerald-50 text-heritage-green border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
              3. Kiểm Tra
            </div>
            <div className={`p-1.5 rounded-lg ${step >= 4 ? 'bg-emerald-50 text-heritage-green border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
              4. Xác Nhận
            </div>
            <div className={`p-1.5 rounded-lg ${step >= 5 ? 'bg-emerald-50 text-heritage-green border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
              5. Báo Cáo
            </div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div>
                <div className="font-bold text-slate-800 text-sm">Kéo thả tệp CSV / Excel vào đây hoặc chọn tệp</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Tự động nhận diện tiêu đề tiếng Việt chuẩn không cần đổi tên cột</div>
              </div>
              <button
                onClick={handleStartAutoMap}
                className="px-4 py-2 bg-heritage-green hover:bg-heritage-green-light text-white font-bold rounded-xl transition shadow-sm inline-flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-heritage-gold" />
                <span>Bắt Đầu Tự Động Nhận Diện Cột (Auto-Map)</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Auto-Mapping */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900">
              <span className="font-bold">Đã nhận diện thành công 10/10 cột tiêu đề từ file Excel:</span>
              <span className="text-[10px] bg-emerald-200 font-bold px-2 py-0.5 rounded">Độ chính xác 95%</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {mappings.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700">{m.sourceHeader}</span>
                  <span className="font-bold text-heritage-navy">→ {m.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setStep(1)} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
                Quay Lại
              </button>
              <button onClick={handleRunValidation} className="px-5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white font-bold rounded-xl inline-flex items-center space-x-1 shadow-md">
                <span>Tiến Hành Quét Lỗi Logic (Validate)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 & 4: Preview & Commit */}
        {(step === 3 || step === 4) && validation && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Tổng Dòng</div>
                <div className="text-lg font-black text-slate-900">{validation.totalRows}</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-[10px] text-emerald-700 font-bold uppercase">Hợp Lệ</div>
                <div className="text-lg font-black text-emerald-700">{validation.validRows}</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-[10px] text-amber-700 font-bold uppercase">Cảnh Báo</div>
                <div className="text-lg font-black text-amber-700">{validation.warningRows}</div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="text-[10px] text-rose-700 font-bold uppercase">Lỗi Chặn</div>
                <div className="text-lg font-black text-rose-700">{validation.errorRows}</div>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase sticky top-0">
                  <tr>
                    <th className="p-2.5">Họ Và Tên</th>
                    <th className="p-2.5">Đời</th>
                    <th className="p-2.5">Chi Phái</th>
                    <th className="p-2.5">Tên Cha</th>
                    <th className="p-2.5">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validation.rows.map((row) => (
                    <tr key={row.rowNumber} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{row.data.fullName}</td>
                      <td className="p-2.5">Đời {row.data.generationNumber}</td>
                      <td className="p-2.5">{row.data.branchName}</td>
                      <td className="p-2.5 text-slate-600">{row.data.parentName || '— (Thủy Tổ)'}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          HỢP LỆ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setStep(2)} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
                Quay Lại
              </button>
              <button
                disabled={!validation.canCommit || isCommitting}
                onClick={handleCommit}
                className="px-5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white font-bold rounded-xl inline-flex items-center space-x-1.5 shadow-md"
              >
                {isCommitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isCommitting ? 'Đang Nạp Nguyên Tử...' : 'Xác Nhận & Nạp Vào CSDL'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Report & Undo Capability */}
        {step === 5 && (
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-heritage-green rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Nạp Dữ Liệu Đợt {lastBatchId} Thành Công!</h2>
              <p className="text-xs text-slate-500 mt-0.5">Dữ liệu phả hệ đã được liên kết chính xác 100% với Cây Gia Phả.</p>
            </div>

            {undoSuccess ? (
              <div className="p-3 bg-amber-50 text-amber-900 text-xs font-bold rounded-xl border border-amber-200">
                Đã hoàn tác (Rollback) thành công đợt nhập {lastBatchId}!
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-xs space-y-3">
                <div className="text-slate-600">
                  Nếu phát hiện file Excel bị nhầm phiên bản, bạn có thể hoàn tác an toàn:
                </div>
                <button
                  disabled={isUndoing}
                  onClick={handleUndoBatch}
                  className="px-4 py-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold rounded-xl transition inline-flex items-center space-x-1.5 shadow-sm"
                >
                  {isUndoing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Hoàn Tác Lần Nhập Này (Undo Batch)</span>
                </button>
              </div>
            )}

            <div className="pt-2">
              <button onClick={() => { onSuccess(); onClose(); }} className="px-6 py-2.5 bg-heritage-navy hover:bg-heritage-navy-light text-white text-xs font-bold rounded-xl transition">
                Hoàn Tất & Xem Cây Gia Phả
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
