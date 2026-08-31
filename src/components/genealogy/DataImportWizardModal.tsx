import React, { useState, useRef } from 'react';
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, 
  ArrowRight, ArrowLeft, ShieldCheck, Download, Loader2, Sparkles, 
  RotateCcw, FileText, Check, HelpCircle, Eye, Network, Pencil, Save, X, ChevronDown, ChevronUp, SkipForward, Filter
} from 'lucide-react';
import { 
  DataImportService, 
  RawImportMember, 
  ValidationSummary, 
  ValidatedImportRow,
  ColumnMappingSuggestion, 
  HIERARCHICAL_GENEALOGY_COLUMNS,
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

  // Inline row editing state
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingFields, setEditingFields] = useState<Partial<RawImportMember>>({});
  const [filterMode, setFilterMode] = useState<'ALL' | 'WARNING' | 'ERROR'>('ALL');
  const [errorAccordionOpen, setErrorAccordionOpen] = useState(true);
  const [warningAccordionOpen, setWarningAccordionOpen] = useState(false);

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
    if (!validation) return;
    const targetFamilyId = activeFamily?.id || '';
    setIsCommitting(true);
    setParseError(null);
    try {
      const result = await DataImportService.commitImport(targetFamilyId, validation);
      setIsCommitting(false);
      if (result.success) {
        setCommitResult(result);
        setStep(5);
        onSuccess();
      } else {
        setParseError(result.error || result.message || 'Lỗi không xác định khi lưu vào CSDL');
      }
    } catch (err: any) {
      setIsCommitting(false);
      setParseError(err.message || 'Lỗi kết nối khi nạp dữ liệu');
    }
  };

  // Partial import: skip error rows, commit only valid/warning rows
  const handlePartialCommit = async () => {
    if (!validation) return;
    const targetFamilyId = activeFamily?.id || '';
    const validOnly = {
      ...validation,
      rows: validation.rows.filter((r) => r.status !== 'ERROR'),
    };
    setIsCommitting(true);
    setParseError(null);
    try {
      const result = await DataImportService.commitImport(targetFamilyId, validOnly);
      setIsCommitting(false);
      if (result.success) {
        setCommitResult(result);
        setStep(5);
        onSuccess();
      } else {
        setParseError(result.error || result.message || 'Lỗi không xác định khi lưu vào CSDL');
      }
    } catch (err: any) {
      setIsCommitting(false);
      setParseError(err.message || 'Lỗi kết nối khi nạp dữ liệu');
    }
  };

  // Start editing a row inline
  const handleStartEdit = (rowIndex: number, row: ValidatedImportRow) => {
    setEditingRowIndex(rowIndex);
    setEditingFields({ ...row.data });
  };

  // Save edited row and re-validate the whole dataset
  const handleSaveEdit = () => {
    if (editingRowIndex === null || !validation) return;
    const updatedRows = validation.rows.map((r, idx) => {
      if (idx !== editingRowIndex) return r;
      return { ...r, data: { ...r.data, ...editingFields } };
    });
    const updatedMembers = updatedRows.map((r) => r.data);
    const revalidated = DataImportService.validateImportData(updatedMembers);
    setValidation(revalidated);
    setEditingRowIndex(null);
    setEditingFields({});
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditingFields({});
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[94vh] flex flex-col">
        
        {/* Header & Stepper */}
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
                    Cây Phân Cấp & 12-18 Cột
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Tự Động Nối Cây Phả Hệ</span>
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tự động phân tích cây nhị phân/đa phân, nhận diện vợ chồng, con cái, giờ sinh, giờ mất và đồng bộ 100% CSDL Supabase
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
              2. Nhận Diện Đời
            </div>
            <div className={`p-1.5 rounded-xl transition ${step >= 3 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              3. Sửa & Quét Lỗi
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
                  accept=".xlsx,.xls,.csv" 
                  className="hidden" 
                />
                
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-[#166534] dark:text-emerald-300 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                  {isParsing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isParsing ? 'Đang phân tích bảng tính Excel...' : 'Nhấp hoặc kéo thả file Excel gia phả vào đây'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Hỗ trợ định dạng chuẩn Microsoft Excel (.xlsx, .xls) hoặc CSV
                  </p>
                </div>

                {selectedFile && !isParsing && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
                    <FileText className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
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

              {/* Banner Hướng dẫn & Tải file mẫu Phân Cấp & Âm Dương Lịch */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 to-emerald-50/80 dark:from-amber-950/30 dark:to-emerald-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Chuẩn Phả Hệ Tự Động: Hỗ Trợ Cột Phân Cấp & Ngày Mất Âm Lịch</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Hệ thống tự động nối cây qua <strong>Mã Cây (treeCode)</strong> hoặc <strong>Tên Cha / Mẹ / Vợ / Chồng</strong>, tự động chuyển đổi ngày giỗ Âm Lịch sang Dương Lịch.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadTemplate}
                    className="shrink-0 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#166534] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File Mẫu Chuẩn (18 Cột)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/40 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Tự động nhận diện Đời (Thế hệ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Hỗ trợ Can Chi & Giờ Sinh / Mất</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Âm Dương Lịch & Lễ Giỗ Tự Động</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Phân nhánh Chi Phái đa chi</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Nhận Diện & Ghép Cột */}
          {step === 2 && parseResult && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-emerald-900 dark:text-emerald-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Đã nhận diện {parseResult.mappedMembers.length} thành viên từ tệp Excel</span>
                  </span>
                  <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 font-bold px-2.5 py-0.5 rounded-full">
                    Ghép {mappings.filter(m => m.targetField !== 'unknown').length}/{mappings.length} cột
                  </span>
                </div>

                {parseResult.autoInferredCount > 0 && (
                  <div className="p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      <strong>Thuật toán thông minh:</strong> Đã tự động suy luận và điền chính xác <strong>{parseResult.autoInferredCount} thế hệ (đời)</strong> dựa trên mối liên kết Cha - Con & Vợ - Chồng.
                    </span>
                  </div>
                )}
              </div>

              {/* Bảng Ánh xạ Cột */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>Kiểm Tra Ánh Xạ Cột Dữ Liệu</span>
                  <span className="text-[10px] text-slate-400">Chọn đúng trường tương ứng nếu hệ thống nhận diện chưa khớp</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                  {mappings.map((m, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-slate-900 dark:text-slate-100 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {m.sourceHeader}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-500 dark:text-slate-400">gán vào</span>
                      </div>

                      <select
                        value={m.targetField}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMappings(maps => maps.map((item, i) => i === idx ? { ...item, targetField: val } : item));
                        }}
                        className={`text-xs px-2.5 py-1 rounded-xl border font-medium transition ${
                          m.targetField !== 'unknown' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        <option value="unknown">-- Bỏ qua cột này --</option>
                        {HIERARCHICAL_GENEALOGY_COLUMNS.map((col) => (
                          <option key={col.field} value={col.field}>
                            {col.label} {col.required ? '(*)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nút Chuyển tiếp */}
              <div className="flex items-center justify-between pt-2">
                <button 
                  onClick={() => setStep(1)} 
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer text-xs"
                >
                  ← Chọn Lại File
                </button>
                <button
                  onClick={handleRunValidation}
                  className="px-5 py-2 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl shadow-md transition inline-flex items-center space-x-1.5 cursor-pointer text-xs"
                >
                  <span>Tiếp Tục: Kiểm Tra Logic & Cây</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Quét Lỗi Logic, Chỉnh Sửa Trực Tiếp & Xem Trước */}
          {step === 3 && validation && (
            <div className="space-y-4">
              
              {/* Thống kê Tổng quan */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Tổng Thành Viên</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{validation.totalRows}</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Hợp Lệ Hoàn Toàn</div>
                  <div className="text-xl font-black text-[#166534] dark:text-emerald-400 mt-0.5">{validation.validRows}</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl">
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Cảnh Báo Cần Lưu Ý</div>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{validation.warningRows}</div>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl">
                  <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">Lỗi Chặn Nạp</div>
                  <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{validation.errorRows}</div>
                </div>
              </div>

              {/* Accordion Chi tiết Dòng LỖI (nếu có) */}
              {validation.errorRows > 0 && (
                <div className="border border-rose-200 dark:border-rose-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setErrorAccordionOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 font-bold text-xs cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-950/70 transition"
                  >
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span>Chi tiết {validation.errorRows} dòng có lỗi chặn nạp — Bấm để xem và sửa tay trực tiếp</span>
                    </span>
                    {errorAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {errorAccordionOpen && (
                    <div className="divide-y divide-rose-100 dark:divide-rose-900/60 max-h-60 overflow-y-auto">
                      {validation.rows
                        .map((row, idx) => ({ row, idx }))
                        .filter(({ row }) => row.status === 'ERROR')
                        .map(({ row, idx }) => (
                          <div key={idx} className="px-4 py-3 bg-white dark:bg-slate-900 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-1">
                                <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/60 rounded text-[10px] font-mono">
                                    Dòng {row.rowNumber}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-200">{row.data.fullName || '(Chưa có tên)'}</span>
                                </div>
                                {row.errors.map((err, ei) => (
                                  <div key={ei} className="text-[11px] text-rose-700 dark:text-rose-400 flex items-start gap-1.5 pl-2">
                                    <span className="text-rose-500 mt-0.5">✗</span>
                                    <span>{err}</span>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => handleStartEdit(idx, row)}
                                className="shrink-0 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                              >
                                <Pencil className="w-3 h-3" />
                                <span>Sửa dòng này</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Accordion Chi tiết Dòng CẢNH BÁO (nếu có) */}
              {validation.warningRows > 0 && (
                <div className="border border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setWarningAccordionOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold text-xs cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/60 transition"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Chi tiết {validation.warningRows} dòng có cảnh báo niêm đại / logic (vẫn cho phép nạp)</span>
                    </span>
                    {warningAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {warningAccordionOpen && (
                    <div className="divide-y divide-amber-100 dark:divide-amber-900/60 max-h-52 overflow-y-auto">
                      {validation.rows
                        .map((row, idx) => ({ row, idx }))
                        .filter(({ row }) => row.status === 'WARNING')
                        .map(({ row, idx }) => (
                          <div key={idx} className="px-4 py-2.5 bg-white dark:bg-slate-900 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-1">
                                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 rounded text-[10px] font-mono">
                                    Dòng {row.rowNumber}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-200">{row.data.fullName || '(Chưa có tên)'}</span>
                                </div>
                                {row.warnings.map((warn, wi) => (
                                  <div key={wi} className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5 pl-2">
                                    <span className="text-amber-500 mt-0.5">⚠</span>
                                    <span>{warn}</span>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => handleStartEdit(idx, row)}
                                className="shrink-0 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                              >
                                <Pencil className="w-3 h-3" />
                                <span>Chỉnh sửa</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Filter Tabs & Preview Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Xem & Chỉnh Sửa Trực Tiếp ({validation.rows.length} dòng):</span>
                  <span className="text-slate-400 font-normal">Bấm biểu tượng <strong>Cây Bút</strong> trên từng dòng để sửa trực tiếp</span>
                </div>
                
                {/* 3-State Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setFilterMode('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      filterMode === 'ALL'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Tất cả ({validation.totalRows})
                  </button>
                  <button
                    onClick={() => setFilterMode('WARNING')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      filterMode === 'WARNING'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'text-amber-700 dark:text-amber-400 hover:text-amber-900'
                    }`}
                  >
                    Cảnh báo ({validation.warningRows})
                  </button>
                  <button
                    onClick={() => setFilterMode('ERROR')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      filterMode === 'ERROR'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 shadow-xs'
                        : 'text-rose-700 dark:text-rose-400 hover:text-rose-900'
                    }`}
                  >
                    Dòng lỗi ({validation.errorRows})
                  </button>
                </div>
              </div>

              {/* Bảng Xem trước & Chỉnh sửa Trực Tiếp Cây Phả Hệ */}
              <div className="max-h-72 overflow-x-auto overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5">Mã Cây</th>
                      <th className="p-2.5">Họ và Tên</th>
                      <th className="p-2.5">Tên Tự / Hiệu</th>
                      <th className="p-2.5">Giới Tính</th>
                      <th className="p-2.5">Đời (Thế Hệ)</th>
                      <th className="p-2.5">Chi Phái</th>
                      <th className="p-2.5">Cha (Mã/Tên)</th>
                      <th className="p-2.5">Mẹ (Mã)</th>
                      <th className="p-2.5">Vợ / Chồng</th>
                      <th className="p-2.5">Sinh (Dương / Âm / Giờ)</th>
                      <th className="p-2.5">Mất (Âm / Dương / Giờ)</th>
                      <th className="p-2.5">Nơi An Táng</th>
                      <th className="p-2.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {validation.rows
                      .filter((row) => {
                        if (filterMode === 'ERROR') return row.status === 'ERROR';
                        if (filterMode === 'WARNING') return row.status === 'WARNING';
                        return true;
                      })
                      .map((row) => {
                        const realIdx = validation.rows.indexOf(row);
                        const isEditing = editingRowIndex === realIdx;

                        return (
                          <React.Fragment key={row.rowNumber}>
                            <tr
                              className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                                isEditing 
                                  ? 'bg-amber-50/60 dark:bg-amber-950/30' 
                                  : row.status === 'ERROR' 
                                    ? 'bg-rose-50/40 dark:bg-rose-950/20' 
                                    : row.status === 'WARNING' 
                                      ? 'bg-amber-50/30 dark:bg-amber-950/10' 
                                      : ''
                              }`}
                            >
                              <td className="p-2.5">
                                {row.data.treeCode ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    {row.data.treeCode}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-mono">#{row.rowNumber}</span>
                                )}
                              </td>
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                                <div className="flex items-center gap-1.5">
                                  <span>{row.data.fullName}</span>
                                  {row.data.relationType && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-normal">
                                      {row.data.relationType}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.data.courtesyName || '—'}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.data.gender === 'MALE' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300'}`}>
                                  {row.data.gender === 'MALE' ? 'Nam' : 'Nữ'}
                                </span>
                              </td>
                              <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                                <span className="inline-flex items-center gap-1">
                                  <span>Đời {row.data.generationNumber}</span>
                                  {row.data.isAutoInferredGen && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded font-normal">
                                      ✨ Tự động
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="p-2.5">{row.data.branchName}</td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">
                                {row.data.parentCode || row.data.parentName || '— (Khởi Tổ)'}
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.data.motherCode || '—'}</td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.data.spouseCode || row.data.spouseName || '—'}</td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">
                                {row.data.birthSolarDate || row.data.birthLunarDate || row.data.birthYear ? (
                                  <div className="space-y-0.5">
                                    {row.data.birthSolarDate && <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200">DL: {row.data.birthSolarDate}</div>}
                                    {row.data.birthLunarDate && <div className="text-[10px] text-amber-700 dark:text-amber-400">ÂL: {row.data.birthLunarDate}</div>}
                                    {!row.data.birthSolarDate && !row.data.birthLunarDate && row.data.birthYear && <div>Năm: {row.data.birthYear}</div>}
                                    {row.data.birthTime && <div className="text-[10px] text-slate-400">🕒 {row.data.birthTime}</div>}
                                  </div>
                                ) : '—'}
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">
                                {row.data.lifeStatus === 'ALIVE' ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Còn sống</span>
                                ) : row.data.deathLunarDay || row.data.deathLunarFull || row.data.deathSolarDate || row.data.deathLunarYear ? (
                                  <div className="space-y-0.5">
                                    {(row.data.deathLunarDay && row.data.deathLunarMonth) ? (
                                      <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                                        Giỗ ÂL: {row.data.deathLunarDay}/{row.data.deathLunarMonth}{row.data.deathLunarYear ? `/${row.data.deathLunarYear}` : ''}
                                      </div>
                                    ) : row.data.deathLunarFull ? (
                                      <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">Giỗ ÂL: {row.data.deathLunarFull}</div>
                                    ) : null}
                                    {row.data.deathSolarDate && <div className="text-[10px] text-slate-500 dark:text-slate-400">DL: {row.data.deathSolarDate}</div>}
                                    {row.data.deathTime && <div className="text-[10px] text-slate-400">🕒 {row.data.deathTime}</div>}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">Đã mất</span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{row.data.burialPlace || '—'}</td>
                              <td className="p-2.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
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
                                  <button
                                    onClick={() => isEditing ? handleCancelEdit() : handleStartEdit(realIdx, row)}
                                    className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                      isEditing 
                                        ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100' 
                                        : 'hover:bg-amber-50 dark:hover:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                    }`}
                                    title="Sửa trực tiếp dòng này"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{isEditing ? 'Đang sửa' : 'Sửa'}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* INLINE ROW EDITOR — HIỂN THỊ NGAY DƯỚI DÒNG KHI BẤM SỬA */}
                            {isEditing && (
                              <tr className="bg-amber-50/90 dark:bg-amber-950/40 border-y-2 border-amber-400">
                                <td colSpan={13} className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                        <Pencil className="w-4 h-4 text-amber-600" />
                                        <span>Chỉnh sửa thông tin dòng #{row.rowNumber}: <strong>{row.data.fullName || '(Chưa có tên)'}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={handleSaveEdit}
                                          className="px-3.5 py-1.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                                        >
                                          <Save className="w-3.5 h-3.5" />
                                          <span>Lưu & Tự Động Kiểm Tra Lại</span>
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                          <span>Hủy</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Grid form chỉnh sửa */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Mã Cây (treeCode)</label>
                                        <input
                                          placeholder="VD: 1.1, 1-V1..."
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.treeCode ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, treeCode: e.target.value }))}
                                        />
                                      </div>
                                      <div className="lg:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Họ và Tên <span className="text-rose-500">*</span></label>
                                        <input
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.fullName ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, fullName: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Tên Tự / Hiệu</label>
                                        <input
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.courtesyName ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, courtesyName: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Giới Tính <span className="text-rose-500">*</span></label>
                                        <select
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.gender ?? 'MALE'}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, gender: e.target.value as any }))}
                                        >
                                          <option value="MALE">Nam</option>
                                          <option value="FEMALE">Nữ</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Đời (Thế Hệ) <span className="text-rose-500">*</span></label>
                                        <input
                                          type="number"
                                          min={1} max={30}
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.generationNumber ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, generationNumber: Number(e.target.value) }))}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Chi Phái <span className="text-rose-500">*</span></label>
                                        <input
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.branchName ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, branchName: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Cha (Mã / Tên)</label>
                                        <input
                                          placeholder="VD: 1.1 hoặc Tên Cha"
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.parentCode ?? editingFields.parentName ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, parentCode: e.target.value, parentName: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Mẹ (Mã / Tên)</label>
                                        <input
                                          placeholder="VD: 1-V1 hoặc Tên Mẹ"
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.motherCode ?? editingFields.motherName ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, motherCode: e.target.value, motherName: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Vợ/Chồng (Mã/Tên)</label>
                                        <input
                                          placeholder="VD: Mã hoặc Tên"
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.spouseCode ?? editingFields.spouseName ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, spouseCode: e.target.value, spouseName: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Trạng Thái Sống</label>
                                        <select
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.lifeStatus ?? 'DECEASED'}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, lifeStatus: e.target.value as any }))}
                                        >
                                          <option value="ALIVE">Còn sống</option>
                                          <option value="DECEASED">Đã mất</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Năm Sinh / Ngày Sinh</label>
                                        <input
                                          placeholder="VD: 1950 hoặc 15/08/1950"
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.birthSolarDate ?? editingFields.birthYear ?? ''}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d{4}$/.test(val)) {
                                              setEditingFields((f) => ({ ...f, birthYear: Number(val), birthSolarDate: undefined }));
                                            } else {
                                              setEditingFields((f) => ({ ...f, birthSolarDate: val, birthYear: undefined }));
                                            }
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Ngày/Tháng/Năm Mất Âm (Giỗ)</label>
                                        <div className="grid grid-cols-3 gap-1">
                                          <input
                                            type="number"
                                            min={1} max={30}
                                            placeholder="Ngày"
                                            className="w-full text-xs px-1.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            value={editingFields.deathLunarDay ?? ''}
                                            onChange={(e) => setEditingFields((f) => ({ ...f, deathLunarDay: Number(e.target.value) || undefined }))}
                                          />
                                          <input
                                            type="number"
                                            min={1} max={12}
                                            placeholder="Tháng"
                                            className="w-full text-xs px-1.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            value={editingFields.deathLunarMonth ?? ''}
                                            onChange={(e) => setEditingFields((f) => ({ ...f, deathLunarMonth: Number(e.target.value) || undefined }))}
                                          />
                                          <input
                                            type="number"
                                            placeholder="Năm"
                                            className="w-full text-xs px-1.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            value={editingFields.deathLunarYear ?? ''}
                                            onChange={(e) => setEditingFields((f) => ({ ...f, deathLunarYear: Number(e.target.value) || undefined }))}
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Giờ Sinh / Mất</label>
                                        <div className="grid grid-cols-2 gap-1">
                                          <input
                                            placeholder="Giờ sinh"
                                            className="w-full text-xs px-1.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            value={editingFields.birthTime ?? ''}
                                            onChange={(e) => setEditingFields((f) => ({ ...f, birthTime: e.target.value }))}
                                          />
                                          <input
                                            placeholder="Giờ mất"
                                            className="w-full text-xs px-1.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            value={editingFields.deathTime ?? ''}
                                            onChange={(e) => setEditingFields((f) => ({ ...f, deathTime: e.target.value }))}
                                          />
                                        </div>
                                      </div>
                                      <div className="lg:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Nơi An Táng (Mộ Phần)</label>
                                        <input
                                          placeholder="VD: Nghĩa trang quê nhà..."
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.burialPlace ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, burialPlace: e.target.value }))}
                                        />
                                      </div>
                                      <div className="lg:col-span-4">
                                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">Tiểu Sử / Sự Nghiệp / Ghi Chú</label>
                                        <input
                                          placeholder="Ghi chú thêm..."
                                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                          value={editingFields.bio ?? ''}
                                          onChange={(e) => setEditingFields((f) => ({ ...f, bio: e.target.value }))}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Thông báo lỗi khi Commit (nếu có) */}
              {parseError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl flex items-start gap-3 text-xs shadow-md animate-fade-in">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-sm">Lỗi Khi Nạp Dữ Liệu Vào Supabase:</p>
                    <p className="font-mono text-xs break-all bg-white/80 dark:bg-black/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900">{parseError}</p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400">Vui lòng kiểm tra lại kết nối mạng hoặc sửa các dòng có lỗi logic phía trên trước khi nạp lại.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons & Commit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setStep(2)} 
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer text-xs"
                >
                  ← Ghép Cột
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Partial import button — chỉ hiện khi có lỗi nhưng có ít nhất 1 dòng hợp lệ */}
                  {validation.errorRows > 0 && (validation.validRows + validation.warningRows) > 0 && (
                    <button
                      disabled={isCommitting}
                      onClick={handlePartialCommit}
                      className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer text-xs shadow-sm"
                    >
                      {isCommitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SkipForward className="w-3.5 h-3.5" />}
                      <span>Bỏ Qua {validation.errorRows} Dòng Lỗi & Nạp {validation.validRows + validation.warningRows} Dòng Hợp Lệ</span>
                    </button>
                  )}

                  {/* Full commit button */}
                  <button
                    disabled={!validation.canCommit || isCommitting}
                    onClick={handleCommit}
                    className={`px-6 py-2.5 font-bold rounded-xl inline-flex items-center justify-center gap-2 shadow-md transition cursor-pointer text-xs ${
                      validation.canCommit && !isCommitting
                        ? 'bg-[#166534] hover:bg-[#14532d] text-white hover:scale-[1.02]'
                        : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isCommitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{isCommitting ? 'Đang Nạp Vào Supabase...' : `Xác Nhận & Nạp ${validation.validRows + validation.warningRows} Thành Viên`}</span>
                  </button>
                </div>
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

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl shadow-md transition cursor-pointer mx-auto"
              >
                Đóng & Xem Cây Phả Hệ Trực Tiếp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
