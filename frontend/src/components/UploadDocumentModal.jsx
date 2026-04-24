import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { XMarkIcon, DocumentArrowUpIcon, ArrowUpTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { uploadDocument } from '../api/documents';
import { useBillingUsage } from '../hooks/useBillingUsage';

const MAX_SIZE = 20 * 1024 * 1024;

export default function UploadDocumentModal({ onClose }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const { data: billing } = useBillingUsage();

    const docsUsed  = billing?.usage?.documents_this_month ?? 0;
    const docsLimit = billing?.usage?.documents_limit ?? billing?.limits?.documents_per_month ?? -1;
    const atLimit   = docsLimit !== -1 && docsUsed >= docsLimit;

    const [title, setTitle]         = useState('');
    const [file, setFile]           = useState(null);
    const [expiresAt, setExpiresAt] = useState('');
    const [progress, setProgress]   = useState(0);
    const [dragOver, setDragOver]   = useState(false);
    const [errors, setErrors]       = useState({});

    const mutation = useMutation({
        mutationFn: (formData) =>
            uploadDocument(formData, (e) => {
                if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            onClose();
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            }
        },
    });

    const handleFile = useCallback((f) => {
        if (!f || f.type !== 'application/pdf') {
            setErrors({ file: ['Solo se aceptan archivos PDF.'] });
            return;
        }
        if (f.size > MAX_SIZE) {
            setErrors({ file: ['El archivo no puede superar 20 MB.'] });
            return;
        }
        setErrors((prev) => ({ ...prev, file: undefined }));
        setFile(f);
        if (!title) setTitle(f.name.replace(/\.pdf$/i, ''));
    }, [title]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    }, [handleFile]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) { setErrors({ file: ['Selecciona un archivo PDF.'] }); return; }
        const fd = new FormData();
        fd.append('title', title);
        fd.append('file', file);
        if (expiresAt) fd.append('expires_at', expiresAt);
        setProgress(0);
        mutation.mutate(fd);
    };

    const fmt = (bytes) =>
        bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Subir documento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {atLimit && (
                        <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-yellow-800">
                                    Has alcanzado el límite de {docsLimit} documentos este mes.
                                </p>
                                <Link to="/settings/billing" onClick={onClose} className="text-sm text-yellow-700 underline hover:text-yellow-900">
                                    Ver planes
                                </Link>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            maxLength={255}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="Nombre del documento"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-600">{errors.title[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Archivo PDF
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={onDrop}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'}`}
                        >
                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <DocumentArrowUpIcon className="w-8 h-8 text-indigo-500 shrink-0" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-52">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">{fmt(file.size)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        Arrastra un PDF aquí o{' '}
                                        <span className="text-indigo-600 font-medium">selecciona un archivo</span>
                                    </p>
                                    <p className="text-xs text-gray-400">Solo PDF · Máximo 20 MB</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files[0])}
                        />
                        {errors.file && (
                            <p className="mt-1 text-xs text-red-600">{errors.file[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha límite de firma <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="date"
                            value={expiresAt}
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Si se establece, el documento caducará automáticamente en esa fecha.
                        </p>
                        {errors.expires_at && (
                            <p className="mt-1 text-xs text-red-600">{errors.expires_at[0]}</p>
                        )}
                    </div>

                    {mutation.isPending && (
                        <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Subiendo…</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-200"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {mutation.isError && !Object.keys(errors).length && (
                        <p className="text-sm text-red-600">
                            {mutation.error?.response?.data?.message ?? 'Error al subir el documento.'}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={mutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending || !file || atLimit}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Subiendo…' : 'Subir documento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
