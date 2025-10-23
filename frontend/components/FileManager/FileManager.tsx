'use client'

import api from "@/lib/api";
import { FileItem } from "@/types";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import DocumentViewer from "../Chat/DocumentViewer";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import FileList from "./FileList";

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    fileId: string;
    fileName: string;
  } | null>(null);
  const [fileToDelete, setFileToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/files");
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check status of files being processed
  const checkFileStatus = async (fileId: string) => {
    try {
      const response = await api.get(`/files/${fileId}/status`);
      return response.data;
    } catch (error) {
      console.error("Error checking file status:", error);
      return null;
    }
  };

  // Poll files that are not yet processed
  useEffect(() => {
    const pendingFiles = files.filter((file) => !file.isProcessed);

    if (pendingFiles.length === 0) {
      return;
    }

    const interval = setInterval(async () => {
      let updated = false;

      for (const file of pendingFiles) {
        const updatedFile = await checkFileStatus(file.id);
        if (updatedFile && updatedFile.isProcessed) {
          updated = true;
          // Update the specific file in the state
          setFiles((prevFiles) =>
            prevFiles.map((f) => (f.id === updatedFile.id ? updatedFile : f))
          );
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [files]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        await api.post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setUploading(false);
    fetchFiles();
  };

  const handleDeleteClick = (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName });
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/files/${fileToDelete.id}`);
      setFileToDelete(null);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      // Optionnel: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setFileToDelete(null);
  };

  const handleView = (fileId: string, fileName: string) => {
    setSelectedDocument({ fileId, fileName });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Mes Documents
        </h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-800/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600 dark:text-gray-300">
              {uploading ? (
                <p className="font-medium">Upload en cours...</p>
              ) : isDragActive ? (
                <p className="font-medium">Déposez les fichiers ici</p>
              ) : (
                <>
                  <p className="font-medium">
                    Glissez-déposez vos fichiers ici, ou cliquez pour
                    sélectionner
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Formats supportés: PDF, XLSX, CSV, DOCX, TXT
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <FileList
        files={files}
        onDelete={handleDeleteClick}
        onView={handleView}
        loading={loading}
      />

      {selectedDocument && (
        <DocumentViewer
          fileId={selectedDocument.fileId}
          fileName={selectedDocument.fileName}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {fileToDelete && (
        <ConfirmDeleteModal
          fileName={fileToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
