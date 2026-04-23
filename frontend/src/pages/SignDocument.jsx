import { useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import {
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { getSignRequest, signDocument } from '../api/sign';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const SIGNER_BADGE = {
    pending:  'bg-gray-100 text-gray-600',
    viewed:   'bg-blue-100 text-blue-700',
    signed:   'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};
const SIGNER_LABEL = { pending: 'Pendiente', viewed: 'Visto', signed: 'Firmado', rejected: 'Rechazado' };
const SIGNER_ICON  = {
    pending:  <ClockIcon className="w-3.5 h-3.5" />,
    viewed:   <EyeIcon className="w-3.5 h-3.5" />,
    signed:   <CheckCircleIcon className="w-3.5 h-3.5" />,
    rejected: <XCircleIcon className="w-3.5 h-3.5" />,
};

function Header() {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shrink-0">
            <span className="text-xl font-bold text-indigo-600">DocFlow</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Solicitud de firma</span>
        </header>
    );
}

export default function SignDocument() {
    const { token } = useParams();

    const [numPages, setNumPages]         = useState(null);
    const [pageNumber, setPageNumber]     = useState(1);
    const [accepted, setAccepted]         = useState(false);
    const [isSigned, setIsSigned]         = useState(false);
    const [signResult, setSignResult]     = useState(null);
    const sigPad = useRef(null);

    const signMutation = useMutation({
        mutationFn: (signatureData) => signDocument(token, signatureData).then((r) => r.data.data),
        onSuccess: (result) => setSignResult(result),
    });

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sign', token],
        queryFn:  () => getSignRequest(token).then((r) => r.data.data),
        retry: false,
    });

    const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
        setNumPages(n);
        setPageNumber(1);
    }, []);

    const clearPad = () => {
        sigPad.current?.clear();
        setIsSigned(false);
    };

    if (signResult) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-sm px-4">
                        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Documento firmado!</h2>
                        {signResult.all_signed ? (
                            <p className="text-gray-500">
                                Todos los firmantes han completado el proceso. Recibirás el PDF sellado por email en breve.
                            </p>
                        ) : (
                            <p className="text-gray-500">
                                Tu firma ha sido registrada. Se ha notificado al siguiente firmante.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    if (isError) {
        const msg     = error?.response?.data?.message ?? '';
        const expired = msg.toLowerCase().includes('expir') || msg.toLowerCase().includes('caduc');

        if (expired) {
            return (
                <div className="min-h-screen flex flex-col bg-gray-50">
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center max-w-sm px-4">
                            <CalendarDaysIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Este documento ha caducado</h2>
                            <p className="text-gray-500">
                                El plazo para firmar este documento ha finalizado.
                                {data?.document?.sent_by && (
                                    <> Contacta con <strong>{data.document.sent_by}</strong> si necesitas un nuevo documento.</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-sm px-4">
                        <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No se puede firmar</h2>
                        <p className="text-gray-500">{msg || 'Enlace no válido o expirado.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (data?.already_signed) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-sm px-4">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Documento firmado!</h2>
                        <p className="text-gray-500">
                            Ya has firmado este documento. Gracias, <strong>{data.signer_name}</strong>.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { signer, document: doc, signers, preview_url: previewUrl } = data;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <Header />

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
                    <div className="bg-white border-b border-r border-gray-200 flex items-center justify-between px-4 py-2 shrink-0">
                        <span className="text-sm text-gray-600 font-medium truncate">{doc.title}</span>
                        <div className="flex items-center gap-3 shrink-0">
                            <button disabled={pageNumber <= 1} onClick={() => setPageNumber((p) => p - 1)}
                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                                {pageNumber} / {numPages ?? '—'}
                            </span>
                            <button disabled={pageNumber >= numPages} onClick={() => setPageNumber((p) => p + 1)}
                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto flex justify-center p-6">
                        {previewUrl ? (
                            <Document
                                file={previewUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                    </div>
                                }
                                error={<div className="text-red-500 text-sm text-center mt-8">No se pudo cargar el PDF.</div>}
                            >
                                <Page pageNumber={pageNumber} width={560} renderTextLayer renderAnnotationLayer />
                            </Document>
                        ) : (
                            <div className="text-gray-400 text-sm mt-8">Vista previa no disponible.</div>
                        )}
                    </div>
                </div>

                <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto shrink-0">
                    <div className="p-6 space-y-6">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Solicitud de firma</p>
                            <h1 className="text-lg font-bold text-gray-900 mb-2">{doc.title}</h1>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Hola <strong>{signer.name}</strong>,{' '}
                                <strong>{doc.sent_by}</strong> te pide que firmes este documento.
                            </p>
                            {doc.expires_at && (
                                <p className="text-xs text-red-500 mt-2">
                                    ⏰ Fecha límite: {new Date(doc.expires_at).toLocaleDateString('es-ES')}
                                </p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Firmantes
                            </h2>
                            <ul className="space-y-1.5">
                                {signers.map((s) => (
                                    <li key={s.id}
                                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg ${s.id === signer.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-gray-50'}`}
                                    >
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
                                            {s.order}
                                        </div>
                                        <span className="text-sm font-medium text-gray-800 flex-1 truncate">
                                            {s.name}
                                            {s.id === signer.id && <span className="text-indigo-500 text-xs ml-1">(tú)</span>}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${SIGNER_BADGE[s.status]}`}>
                                            {SIGNER_ICON[s.status]}
                                            {SIGNER_LABEL[s.status]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Tu firma
                                </h2>
                                <button onClick={clearPad} className="text-xs text-gray-400 hover:text-gray-600 underline">
                                    Limpiar
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">Firma en el recuadro con el ratón o con el dedo.</p>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white hover:border-indigo-300 transition-colors">
                                <SignatureCanvas
                                    ref={sigPad}
                                    penColor="#1e40af"
                                    canvasProps={{ width: 330, height: 160, className: 'w-full' }}
                                    onEnd={() => setIsSigned(sigPad.current ? !sigPad.current.isEmpty() : false)}
                                />
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="text-sm text-gray-600 leading-relaxed">
                                He leído el documento y presto mi consentimiento para firmarlo electrónicamente.
                            </span>
                        </label>

                        {signMutation.isError && (
                            <p className="text-sm text-red-600 text-center -mt-2">
                                {signMutation.error?.response?.data?.message ?? 'Error al firmar. Inténtalo de nuevo.'}
                            </p>
                        )}

                        <button
                            disabled={!accepted || !isSigned || signMutation.isPending}
                            onClick={() => {
                                const signatureData = sigPad.current.toDataURL('image/png');
                                signMutation.mutate(signatureData);
                            }}
                            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            {signMutation.isPending ? 'Firmando…' : 'Firmar documento'}
                        </button>

                        <p className="text-xs text-center text-gray-400">
                            No necesitas cuenta en DocFlow para firmar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
