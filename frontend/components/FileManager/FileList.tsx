'use client'

import { FileItem } from "@/types";

interface FileListProps {
  files: FileItem[];
  onDelete: (id: string, fileName: string) => void;
  onView: (id: string, fileName: string) => void;
  loading: boolean;
}

export default function FileList({
  files,
  onDelete,
  onView,
  loading,
}: FileListProps) {
  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename);

    // PDF - Icône style Adobe avec "PDF"
    if (extension === "pdf") {
      return {
        bgColor: "bg-red-50 dark:bg-red-950",
        iconColor: "",
        icon: (
          <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="4" width="36" height="40" rx="2" fill="#E53E3E" />
            <path d="M14 14h20v2H14z" fill="white" opacity="0.8" />
            <path d="M14 18h20v2H14z" fill="white" opacity="0.6" />
            <path d="M14 22h12v2H14z" fill="white" opacity="0.4" />
            <text
              x="24"
              y="36"
              fontSize="10"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              fontFamily="Arial"
            >
              PDF
            </text>
          </svg>
        ),
      };
    }

    // Excel - Icône style Microsoft Excel avec grille
    if (extension === "xlsx" || extension === "xls") {
      return {
        bgColor: "bg-green-50 dark:bg-green-950",
        iconColor: "",
        icon: (
          <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="4" width="36" height="40" rx="2" fill="#22C55E" />
            <rect
              x="10"
              y="8"
              width="28"
              height="20"
              fill="white"
              opacity="0.2"
            />
            <path
              d="M10 14h28M10 20h28"
              stroke="white"
              strokeWidth="1"
              opacity="0.4"
            />
            <path
              d="M17 8v20M24 8v20M31 8v20"
              stroke="white"
              strokeWidth="1"
              opacity="0.4"
            />
            <text
              x="24"
              y="40"
              fontSize="9"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              fontFamily="Arial"
            >
              XLSX
            </text>
          </svg>
        ),
      };
    }

    // CSV - Icône tableur simplifié
    if (extension === "csv") {
      return {
        bgColor: "bg-emerald-50 dark:bg-emerald-950",
        iconColor: "",
        icon: (
          <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="4" width="36" height="40" rx="2" fill="#10B981" />
            <rect
              x="10"
              y="10"
              width="28"
              height="16"
              rx="1"
              fill="white"
              opacity="0.2"
            />
            <path
              d="M10 16h28M10 22h28"
              stroke="white"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <path
              d="M19 10v16M29 10v16"
              stroke="white"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <text
              x="24"
              y="40"
              fontSize="10"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              fontFamily="Arial"
            >
              CSV
            </text>
          </svg>
        ),
      };
    }

    // Word - Icône style Microsoft Word avec "W"
    if (extension === "docx" || extension === "doc") {
      return {
        bgColor: "bg-blue-50 dark:bg-blue-950",
        iconColor: "",
        icon: (
          <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="4" width="36" height="40" rx="2" fill="#2563EB" />
            <path
              d="M14 12h20v2H14zM14 16h20v2H14zM14 20h20v2H14zM14 24h14v2H14z"
              fill="white"
              opacity="0.3"
            />
            <text
              x="24"
              y="38"
              fontSize="16"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              fontFamily="Arial"
            >
              W
            </text>
          </svg>
        ),
      };
    }

    // TXT - Icône document texte simple
    if (extension === "txt") {
      return {
        bgColor: "bg-gray-50 dark:bg-gray-900",
        iconColor: "",
        icon: (
          <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="4" width="36" height="40" rx="2" fill="#6B7280" />
            <path
              d="M12 12h24v1.5H12zM12 16h24v1.5H12zM12 20h24v1.5H12zM12 24h24v1.5H12zM12 28h18v1.5H12z"
              fill="white"
              opacity="0.7"
            />
            <text
              x="24"
              y="40"
              fontSize="10"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              fontFamily="Arial"
            >
              TXT
            </text>
          </svg>
        ),
      };
    }

    // Fichier générique - Icône document universel
    return {
      bgColor: "bg-slate-50 dark:bg-slate-900",
      iconColor: "",
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none">
          <rect x="6" y="4" width="36" height="40" rx="2" fill="#64748B" />
          <path d="M30 4h12l-12 12V4z" fill="#475569" />
          <rect
            x="12"
            y="20"
            width="24"
            height="2"
            rx="1"
            fill="white"
            opacity="0.5"
          />
          <rect
            x="12"
            y="26"
            width="24"
            height="2"
            rx="1"
            fill="white"
            opacity="0.5"
          />
          <rect
            x="12"
            y="32"
            width="16"
            height="2"
            rx="1"
            fill="white"
            opacity="0.5"
          />
        </svg>
      ),
    };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>Aucun fichier. Commencez par en ajouter!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Nom du fichier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Taille
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date d'upload
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {files.map((file) => (
            <tr
              key={file.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {(() => {
                    const { bgColor, icon } = getFileIcon(file.originalName);
                    return (
                      <div
                        className={`flex-shrink-0 h-12 w-12 flex items-center justify-center ${bgColor} rounded-lg shadow-sm`}
                      >
                        {icon}
                      </div>
                    );
                  })()}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.originalName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(file.uploadedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    file.isProcessed
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {file.isProcessed ? (
                    <>
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Traité
                    </>
                  ) : (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      En cours
                    </>
                  )}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onView(file.id, file.originalName)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 flex items-center gap-1"
                    title="Visualiser le document"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Voir
                  </button>
                  <button
                    onClick={() => onDelete(file.id, file.originalName)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1"
                    title="Supprimer le fichier"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
