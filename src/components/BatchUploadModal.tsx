import {
  Button,
  Modal,
  Label,
  FileInput,
  Toast,
  Progress,
} from "flowbite-react";
import { useState } from "react";
import { HiCheck, HiX } from "react-icons/hi";
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import * as XLSX from "xlsx";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BatchUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BatchUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const downloadTemplate = (format: "xlsx" | "csv") => {
    const template = [
      {
        "產品編號SKU Number": "BDSP02002",
        "產品編號Product Number": "ZCC-12345",
        "庫存位置Stock Location": "56",
        市集位置: "A1",
        數量Quantity: 12,
        "批發價Wholesale Price": 100,
        "成本價Cost Price": 80,
        "運費Delivery Fee": 5,
        "零售價Retail Price": 120,
        "單價Unit Price": 10,
        "庫存數量Stock Quantity": 100,
        "產品描述Product Description": "Product description",
        "產品系列Product Series": "Series Name",
      },
    ];

    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "inventory_template.xlsx");
    } else {
      const ws = XLSX.utils.json_to_sheet(template);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "inventory_template.csv";
      link.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const isValidFile = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!isValidFile) {
        showToast("Please upload an Excel (.xlsx/.xls) or CSV file", "error");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Please select a file first", "error");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/addBatchUploadStorage", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      showToast(`Successfully uploaded ${result.count} items!`, "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to process batch upload",
        "error"
      );
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <Modal show={isOpen} onClose={onClose} size="md">
        <Modal.Header>Batch Upload Inventory Items</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="template" value="Download Template" />
              <div className="flex gap-2 mt-2">
                <Button
                  color="gray"
                  className="flex-1"
                  onClick={() => downloadTemplate("xlsx")}
                >
                  <FaFileExcel className="mr-2 h-5 w-5" />
                  Excel Template
                </Button>
                <Button
                  color="gray"
                  className="flex-1"
                  onClick={() => downloadTemplate("csv")}
                >
                  <FaFileCsv className="mr-2 h-5 w-5" />
                  CSV Template
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="file_input" value="Upload File" />
              <FileInput
                id="file_input"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="mt-2"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                Upload Excel (.xlsx/.xls) or CSV file
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg dark:bg-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Selected file: {selectedFile.name}
                </span>
                <span className="text-xs text-gray-400">
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}

            {isUploading && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-base font-medium text-blue-700 dark:text-white">
                    Uploading
                  </span>
                  <span className="text-base font-medium text-blue-700 dark:text-white">
                    {progress}%
                  </span>
                </div>
                <Progress progress={progress} />
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="dark"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          <Button color="gray" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {toast.show && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <Toast>
            {toast.type === "success" ? (
              <HiCheck className="h-5 w-5 text-green-600" />
            ) : (
              <HiX className="h-5 w-5 text-red-600" />
            )}
            <div className="pl-4 text-sm font-normal">{toast.message}</div>
          </Toast>
        </div>
      )}
    </>
  );
}
