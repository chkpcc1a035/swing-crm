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
import { UploadResponse } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

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
      console.log("No file selected");
      showToast("Please select a file first", "error");
      return;
    }

    console.log("Starting upload for file:", {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    });

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Debug log FormData contents
      console.log("FormData contents:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          console.log(`Upload progress: ${percentComplete}%`);
          setProgress(percentComplete);
        }
      };

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          console.log("XHR response received:", {
            status: xhr.status,
            response: xhr.responseText,
          });

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText));
          }
        };
        xhr.onerror = () => {
          console.error("XHR network error:", xhr.status, xhr.statusText);
          reject(new Error("Network error"));
        };
      });

      xhr.open("POST", "/api/addBatchUploadStorage", true);
      console.log("Sending XHR request...");
      xhr.send(formData);

      const result = (await uploadPromise) as UploadResponse;
      console.log("Upload result:", result);

      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      showToast(`Successfully uploaded ${result.count} items!`, "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Upload error details:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
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
    <AnimatePresence>
      <Modal
        show={isOpen}
        onClose={onClose}
        size="md"
        className="backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <Modal.Header className="border-b border-gray-200/10 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">
              Batch Upload Inventory Items
            </h3>
          </Modal.Header>
          <Modal.Body className="space-y-6 px-6 py-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <Label
                htmlFor="template"
                value="Download Template"
                className="mb-4 text-gray-200"
              />
              <div className="flex gap-3 mt-3">
                <Button
                  color="gray"
                  className="flex-1 hover:scale-105 transition-transform duration-200 bg-gray-700/50"
                  onClick={() => downloadTemplate("xlsx")}
                >
                  <FaFileExcel className="mr-2 h-5 w-5 text-green-500" />
                  Excel Template
                </Button>
                <Button
                  color="gray"
                  className="flex-1 hover:scale-105 transition-transform duration-200 bg-gray-700/50"
                  onClick={() => downloadTemplate("csv")}
                >
                  <FaFileCsv className="mr-2 h-5 w-5 text-blue-500" />
                  CSV Template
                </Button>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <Label
                htmlFor="file_input"
                value="Upload File"
                className="mb-4 text-gray-200"
              />
              <div className="relative">
                <FileInput
                  id="file_input"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="mt-2 bg-gray-700/50 border-gray-600 text-gray-200"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Upload Excel (.xlsx/.xls) or CSV file
                </p>
              </div>
            </div>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-blue-900/20 rounded-lg border border-blue-800"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-400">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-blue-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => setSelectedFile(null)}
                  className="!p-1 bg-gray-700/50"
                >
                  <HiX className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Uploading...
                  </span>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    {progress}%
                  </span>
                </div>
                <Progress progress={progress} color="blue" className="h-2" />
              </motion.div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-200/10 px-6 py-4">
            <Button
              color="blue"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="hover:scale-105 transition-transform duration-200"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </Button>
            <Button
              color="gray"
              onClick={onClose}
              disabled={isUploading}
              className="hover:scale-105 transition-transform duration-200 bg-gray-700/50"
            >
              Cancel
            </Button>
          </Modal.Footer>
        </motion.div>
      </Modal>

      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-[60]"
          >
            <Toast>
              {toast.type === "success" ? (
                <HiCheck className="h-5 w-5 text-green-600" />
              ) : (
                <HiX className="h-5 w-5 text-red-600" />
              )}
              <div className="pl-4 text-sm font-normal">{toast.message}</div>
            </Toast>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
