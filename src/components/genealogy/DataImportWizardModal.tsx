import React, { useState, useRef } from 'react';
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, 
  ArrowRight, ArrowLeft, ShieldCheck, Download, Loader2, Sparkles, 
  RotateCcw, FileText, Check, HelpCircle, Eye
} from 'lucide-react';
import { 
  DataImportService, 
  RawImportMember, 
  ValidationSummary, 
  ColumnMappingSuggestion, 
  STANDARD_GENEALOGY_COLUMNS,
  ParseResult
} from '../../services/DataImportService';
import { useAuth } from '../../contexts/AuthContext';

interface DataImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DataImportWizardModal: React.FC<DataImportWizardModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { activeFamily } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [mappings, setMappings] = useState<ColumnMappingSuggestion[]>([]);
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<{ batchId: string; insertedCount: number; message: string } | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoSuccess, setUndoSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    if (!file) return;
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setParseError('Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp Excel (.xlsx, .xls) hoặc .csv.');
      return;
    }

    setSelectedFile(file);
    setParseError(null);
    setIsParsing(true);

    try {
      const result = await DataImportService.parseExcelFile(file);
      setParseResult(result);
      setMappings(result.mappings);
      setIsParsing(false);
      setStep(2);
    } catch (err: any) {
      setIsParsing(false);
      setParseError(err.message || 'Lỗi khi phân tích tệp Excel. Vui lòng kiểm tra lại cấu trúc bảng tính.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRunValidation = () => {
    if (!parseResult) return;
    const res = DataImportService.validateImportData(parseResult.mappedMembers);
    setValidation(res);
    setStep(3);
  };

  const handleCommit = async () => {
    if (!validation || !activeFamily?.id) return;
    setIsCommitting(true);
    const result = await DataImportService.commitImport(activeFamily.id, validation);
    setIsCommitting(false);
    if (result.success) {
      setCommitResult(result);
      setStep(5);
    } else {
      setParseError(result.error || result.message);
    }
  };

  const handleUndoBatch = async () => {
    if (!commitResult?.batchId) return;
    setIsUndoing(true);
    await DataImportService.rollbackBatch(commitResult.batchId);
    setIsUndoing(false);
    setUndoSuccess(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  const handleDownloadTemplate = () => {
    DataImportService.downloadStandardTemplateExcel();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[100] animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        
        {/* Header & Steps */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Nhập Gia Phả Từ File Excel</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full">
                    Chuẩn 12 Cột
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tự động phân tích phả đồ, tạo quan hệ thế hệ cha con và lịch giỗ tổ vào CSDL Supabase
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-5 gap-1.5 mt-4 text-center text-[11px] font-bold">
            <div className={`p-1.5 rounded-xl transition ${step >= 1 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              1. Tải Lên Tệp
            </div>
            <div className={`p-1.5 rounded-xl transition ${step >= 2 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              2. Ghép 12 Cột
            </div>
            <div className={`p-1.5 rounded-xl transition ${step >= 3 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              3. Quét Lỗi Logic
            </div>
            <div className={`p-1.5 rounded-xl transition ${step >= 4 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              4. Xem Trước
            </div>
            <div className={`p-1.5 rounded-xl transition ${step >= 5 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              5. Hoàn Tất
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-xs">
          
          {/* STEP 1: Upload / Drag & Drop */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Box Kéo thả */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 sm:p-10 border-2 border-dashed rounded-3xl text-center space-y-3 cursor-pointer transition ${
                  isDragging 
                    ? 'border-[#166534] bg-emerald-50/60 dark:bg-emerald-950/30 scale-[1.01]' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                />

                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-[#166534] dark:text-emerald-300 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  {isParsing ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <div className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
                    {isParsing ? 'Đang đọc và phân tích tệp Excel...' : 'Kéo thả tệp Excel / CSV vào đây, hoặc bấm để chọn tệp'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Hỗ trợ tệp định dạng <strong>.xlsx, .xls, .csv</strong> (Tối đa 10.000 dòng)
                  </div>
                </div>

                {selectedFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl flex items-center gap-2 text-xs font-medium">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Banner Hướng dẫn & Tải file mẫu 12 cột */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 to-emerald-50/80 dark:from-amber-950/30 dark:to-emerald-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Chưa có file mẫu? Tải ngay file Excel 12 cột chuẩn hóa</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      File mẫu có sẵn dữ liệu chuẩn về Thủy tổ, Tiên tổ các đời và các chi phái giúp bạn điền dễ dàng.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Tải File Excel Mẫu (.xlsx)</span>
                  </button>
                </div>

                {/* 12 Cột Chuẩn Danh Mục */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Danh mục 12 cột chuẩn của hệ thống:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 text-[10px]">
                    {STANDARD_GENEALOGY_COLUMNS.map((col, idx) => (
                      <div key={idx} className="p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{idx + 1}. {col.label}</span>
                        {col.required ? (
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">Bắt buộc</span>
                        ) : (
                          <span className="text-[9px] text-slate-400">Tùy chọn</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Auto-Mapping 12 Cột */}
          {step === 2 && parseResult && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-900 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Đã nhận diện {parseResult.mappedMembers.length} dòng thành viên từ tệp Excel</span>
                </span>
                <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 font-bold px-2.5 py-0.5 rounded-full">
                  Ghép {mappings.filter(m => m.targetField !== 'unknown').length}/{mappings.length} cột
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-1">
                {mappings.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Cột trong tệp</div>
                      <div className="font-bold text-slate-800 dark:text-white text-xs">{m.sourceHeader}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Hệ Thống Ánh Xạ</div>
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1">
                        <span>→ {m.label}</span>
                        {m.confidence >= 0.9 && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setStep(1)} 
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer"
                >
                  ← Chọn Lại Tệp
                </button>
                <button 
                  onClick={handleRunValidation} 
                  className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl inline-flex items-center space-x-1.5 shadow-md transition cursor-pointer"
                >
                  <span>Tiến Hành Quét Lỗi Logic (Validate)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Validation Summary & Preview */}
          {(step === 3 || step === 4) && validation && (
            <div className="space-y-4">
              {/* Thẻ Thống kê kết quả quét lỗi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Tổng Số Dòng</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{validation.totalRows}</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Hợp Lệ 100%</div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{validation.validRows}</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl">
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Cảnh Báo</div>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{validation.warningRows}</div>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl">
                  <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">Lỗi Chặn Nạp</div>
                  <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{validation.errorRows}</div>
                </div>
              </div>

              {/* Bảng Xem trước 12 cột dữ liệu */}
              <div className="max-h-64 overflow-x-auto overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Họ và Tên</th>
                      <th className="p-2.5">Giới Tính</th>
                      <th className="p-2.5">Đời</th>
                      <th className="p-2.5">Chi Phái</th>
                      <th className="p-2.5">Tên Cha</th>
                      <th className="p-2.5">Vợ / Chồng</th>
                      <th className="p-2.5">Trạng Thái</th>
                      <th className="p-2.5">Năm Sinh</th>
                      <th className="p-2.5">Ngày Mất Âm</th>
                      <th className="p-2.5">Nơi An Táng</th>
                      <th className="p-2.5 text-right">Đánh Giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {validation.rows.map((row) => (
                      <tr key={row.rowNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-2.5 text-slate-400">{row.rowNumber}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.data.fullName}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.data.gender === 'MALE' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300'}`}>
                            {row.data.gender === 'MALE' ? 'Nam' : 'Nữ'}
                          </span>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">Đời {row.data.generationNumber}</td>
                        <td className="p-2.5">{row.data.branchName}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.data.parentName || '— (Khởi Tổ)'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.data.spouseName || '—'}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.data.lifeStatus === 'ALIVE' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'}`}>
                            {row.data.lifeStatus === 'ALIVE' ? 'Còn sống' : 'Đã mất'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.data.birthYear || '—'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">
                          {row.data.deathLunarDay && row.data.deathLunarMonth ? `${row.data.deathLunarDay}/${row.data.deathLunarMonth} Âm` : '—'}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{row.data.burialPlace || '—'}</td>
                        <td className="p-2.5 text-right">
                          {row.status === 'VALID' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                              HỢP LỆ
                            </span>
                          )}
                          {row.status === 'WARNING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                              CẢNH BÁO
                            </span>
                          )}
                          {row.status === 'ERROR' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                              LỖI
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setStep(2)} 
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer"
                >
                  ← Ghép Cột
                </button>
                <button
                  disabled={!validation.canCommit || isCommitting}
                  onClick={handleCommit}
                  className={`px-6 py-2.5 font-bold rounded-xl inline-flex items-center space-x-2 shadow-md transition cursor-pointer ${
                    validation.canCommit && !isCommitting
                      ? 'bg-[#166534] hover:bg-[#14532d] text-white'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isCommitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isCommitting ? 'Đang Nạp Vào Supabase...' : `Xác Nhận & Nạp ${validation.validRows + validation.warningRows} Thành Viên`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Report & Undo Capability */}
          {step === 5 && commitResult && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-[#166534] dark:text-emerald-300 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nạp Dữ Liệu Gia Phả Thành Công!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {commitResult.message}
                </p>
              </div>

              {undoSuccess ? (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 text-xs font-bold rounded-2xl border border-amber-200 dark:border-amber-800 max-w-md mx-auto">
                  Đã hoàn tác (Rollback) thành công đợt nạp {commitResult.batchId}!
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md mx-auto text-xs space-y-3">
                  <div className="text-slate-600 dark:text-slate-400">
                    Nếu phát hiện dữ liệu nhập nhầm phiên bản, bạn có thể hoàn tác ngay:
                  </div>
                  <button
                    disabled={isUndoing}
                    onClick={handleUndoBatch}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold rounded-xl transition inline-flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    {isUndoing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    <span>Hoàn Tác Lần Nhập Này (Undo Batch)</span>
                  </button>
                </div>
              )}

              <div className="pt-3">
                <button 
                  onClick={() => { onSuccess(); onClose(); }} 
                  className="px-8 py-3 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
                >
                  Hoàn Tất & Xem Cây Gia Phả
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
