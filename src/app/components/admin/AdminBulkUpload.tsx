import React, { useState } from "react";
import { adminApi } from "../../api";
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Cloud,
  Check,
  Info,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

export function AdminBulkUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<any | null>(null);

  // Settings
  const [duplicateAction, setDuplicateAction] = useState<"skip" | "update" | "reject">("skip");
  const [uploadImagesToCloudinary, setUploadImagesToCloudinary] = useState(true);

  // Import Execution
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFile(files[0]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      toast.error("Please upload a valid .csv or .xlsx Excel file.");
      return;
    }

    setSelectedFile(file);
    setValidationReport(null);
    setImportResult(null);
    setValidating(true);

    const toastId = toast.loading(`Validating "${file.name}" row-by-row...`);

    try {
      const res = await adminApi.validateBulkFile(file);
      if (res.success && res.data) {
        setValidationReport(res.data);
        toast.success(res.message || "File validated successfully!", { id: toastId });
      } else {
        toast.error(res.message || "Validation failed", { id: toastId });
      }
    } catch {
      toast.error("Network error validating file", { id: toastId });
    } finally {
      setValidating(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationReport || !validationReport.rows || validationReport.rows.length === 0) {
      toast.error("No validated rows available to import.");
      return;
    }

    // Filter out rows that have fatal errors
    const rowsToImport = validationReport.rows.filter((r: any) => r.status !== "error");

    if (rowsToImport.length === 0) {
      toast.error("Cannot import: All rows have validation errors. Please correct the file.");
      return;
    }

    if (duplicateAction === "reject" && validationReport.existing_sku_count > 0) {
      toast.error("Import rejected: Existing SKUs detected while in strict 'Reject' duplicate mode.");
      return;
    }

    setImporting(true);
    const toastId = toast.loading("Executing bulk import & uploading Cloudinary media...");

    try {
      const res = await adminApi.executeBulkImport(
        rowsToImport,
        duplicateAction,
        uploadImagesToCloudinary
      );

      if (res.success && res.data) {
        setImportResult(res.data);
        toast.success(res.message || "Bulk import completed!", { id: toastId });
      } else {
        toast.error(res.message || "Bulk import failed", { id: toastId });
      }
    } catch {
      toast.error("Network error during bulk import", { id: toastId });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (format: "xlsx" | "csv") => {
    const url = adminApi.getTemplateDownloadUrl(format);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Bulk Product Upload & Excel System
          </h2>
          <p className="text-xs text-gray-500">
            Download pre-formatted templates, upload spreadsheets, review row validations, and import thousands of items with Cloudinary media integration
          </p>
        </div>
      </div>

      {/* Step 1: Download Templates */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            1
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Download Official Product Template</h3>
            <p className="text-xs text-gray-500">
              Pre-structured with headers, data types, sample products, and instructions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Excel Template Card */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between gap-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Excel Template (.xlsx)</p>
                <p className="text-[11px] text-gray-500">Includes styling & instructions tab</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadTemplate("xlsx")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .xlsx
            </button>
          </div>

          {/* CSV Template Card */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between gap-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">CSV Template (.csv)</p>
                <p className="text-[11px] text-gray-500">Universal UTF-8 formatted comma-separated file</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadTemplate("csv")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .csv
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Upload Zone & Configuration */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            2
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Upload File & Choose Settings</h3>
            <p className="text-xs text-gray-500">
              Select your prepared spreadsheet and configure duplicate SKU and Cloudinary behaviors
            </p>
          </div>
        </div>

        {/* Drag & Drop File Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="p-8 border-2 border-dashed border-gray-200 hover:border-black rounded-3xl bg-gray-50/60 text-center flex flex-col items-center justify-center transition-colors cursor-pointer"
        >
          <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
          <p className="text-sm font-bold text-gray-900">
            {selectedFile ? selectedFile.name : "Drag and drop your Excel or CSV file here"}
          </p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Supports .xlsx and .csv files up to 25MB
          </p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm cursor-pointer">
            <span>Browse Computer</span>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={validating || importing}
              className="hidden"
            />
          </label>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Duplicate SKU Handling */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Duplicate SKU Strategy
            </label>
            <p className="text-[11px] text-gray-500">
              Choose how the system handles products whose SKU already exists in your store
            </p>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="duplicateAction"
                  value="skip"
                  checked={duplicateAction === "skip"}
                  onChange={() => setDuplicateAction("skip")}
                  className="text-black focus:ring-black"
                />
                <span className="font-semibold">Skip Duplicates (Recommended)</span>
                <span className="text-[10px] text-gray-400">— Keeps existing items, inserts new only</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="duplicateAction"
                  value="update"
                  checked={duplicateAction === "update"}
                  onChange={() => setDuplicateAction("update")}
                  className="text-black focus:ring-black"
                />
                <span className="font-semibold">Update / Overwrite</span>
                <span className="text-[10px] text-gray-400">— Updates price, stock & details for matching SKUs</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="duplicateAction"
                  value="reject"
                  checked={duplicateAction === "reject"}
                  onChange={() => setDuplicateAction("reject")}
                  className="text-black focus:ring-black"
                />
                <span className="font-semibold">Strict (Reject Entire File)</span>
                <span className="text-[10px] text-gray-400">— Aborts import if any duplicate SKU exists</span>
              </label>
            </div>
          </div>

          {/* Cloudinary Image Upload Toggle */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700">
                <Cloud className="w-4 h-4 text-sky-600" />
                <span>Cloudinary Image Migration</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                When enabled, remote image URLs in your spreadsheet (e.g. Unsplash or supplier URLs) will be automatically downloaded and uploaded directly to your Cloudinary CDN folder for lightning-fast media serving.
              </p>
            </div>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-gray-200 cursor-pointer text-xs font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={uploadImagesToCloudinary}
                onChange={(e) => setUploadImagesToCloudinary(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black"
              />
              <span>Upload image URLs directly to Cloudinary</span>
            </label>
          </div>
        </div>
      </div>

      {/* Step 3: Interactive Row-by-Row Preview & Validation Table */}
      {validationReport && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Validation Results ({validationReport.total_rows} rows analyzed)
                </h3>
                <p className="text-xs text-gray-500">
                  Review row statuses and check for errors prior to committing import to MongoDB
                </p>
              </div>
            </div>

            {/* Execute Import Action Button */}
            <button
              type="button"
              disabled={importing || validationReport.valid_count === 0}
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-all shadow-md disabled:opacity-40 cursor-pointer"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Bulk Import...
                </>
              ) : (
                <>
                  <span>Execute Bulk Import</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Validation Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Rows</span>
              <p className="text-xl font-black text-gray-900">{validationReport.total_rows}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
              <span className="text-[11px] font-semibold uppercase">Valid Ready</span>
              <p className="text-xl font-black text-emerald-700">{validationReport.valid_count}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
              <span className="text-[11px] font-semibold uppercase">Warnings</span>
              <p className="text-xl font-black text-amber-700">{validationReport.warning_count}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-900">
              <span className="text-[11px] font-semibold uppercase">Errors</span>
              <p className="text-xl font-black text-red-700">{validationReport.error_count}</p>
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10 text-[11px] font-bold uppercase text-gray-500">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Sale Price</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Validation Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {validationReport.rows.map((row: any) => {
                    const isErr = row.status === "error";
                    const isWarn = row.status === "warning";
                    const d = row.data || {};

                    return (
                      <tr
                        key={row.row_index}
                        className={`hover:bg-gray-50/60 ${
                          isErr ? "bg-red-50/30" : isWarn ? "bg-amber-50/20" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-500">
                          #{row.row_index}
                        </td>

                        <td className="py-2.5 px-3">
                          {isErr ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              <XCircle className="w-3 h-3" /> Error
                            </span>
                          ) : isWarn ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3" /> Warning
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-semibold text-gray-900 max-w-[180px] truncate">
                          {d.name || "<Missing Name>"}
                        </td>

                        <td className="py-2.5 px-3 font-mono font-bold">
                          {d.sku || "<Missing SKU>"}
                          {row.is_duplicate_db && (
                            <span className="block text-[9px] text-amber-600 font-sans">
                              (Exists in DB)
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-gray-700">
                          {d.category || "General"}
                        </td>

                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          ₹{d.sale_price !== undefined ? Number(d.sale_price).toFixed(2) : "0.00"}
                        </td>

                        <td className="py-2.5 px-3 text-gray-800 font-semibold">
                          {d.stock || 0}
                        </td>

                        <td className="py-2.5 px-3 max-w-[260px]">
                          {row.errors?.length > 0 ? (
                            <div className="text-red-600 text-[11px]">
                              {row.errors.join(", ")}
                            </div>
                          ) : row.warnings?.length > 0 ? (
                            <div className="text-amber-700 text-[11px]">
                              {row.warnings.join(", ")}
                            </div>
                          ) : (
                            <span className="text-emerald-600 font-medium">Ready for import</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Import Result Report */}
      {importResult && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Bulk Import Execution Summary</h3>
              <p className="text-xs text-gray-500">{importResult.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
              <span className="text-[11px] font-semibold uppercase">New Products Imported</span>
              <p className="text-2xl font-black text-emerald-700">{importResult.imported_count}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-sky-900">
              <span className="text-[11px] font-semibold uppercase">Updated Existing</span>
              <p className="text-2xl font-black text-sky-700">{importResult.updated_count}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700">
              <span className="text-[11px] font-semibold uppercase">Skipped Duplicates</span>
              <p className="text-2xl font-black text-gray-900">{importResult.skipped_count}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-900">
              <span className="text-[11px] font-semibold uppercase">Failed Items</span>
              <p className="text-2xl font-black text-red-700">{importResult.failed_count}</p>
            </div>
          </div>

          {/* Error Logs Table if failed rows exist */}
          {importResult.error_logs?.length > 0 && (
            <div className="pt-3">
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                Detailed Error Logs
              </h4>
              <div className="border border-red-100 rounded-2xl overflow-hidden bg-red-50/20">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-red-100/50 text-red-900 font-bold text-[10px] uppercase">
                      <th className="py-2 px-3">Row</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100/50">
                    {importResult.error_logs.map((err: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-gray-600">#{err.row_index}</td>
                        <td className="py-2 px-3 font-mono font-bold text-gray-900">{err.sku}</td>
                        <td className="py-2 px-3 text-gray-800">{err.name}</td>
                        <td className="py-2 px-3 text-red-600">{err.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
