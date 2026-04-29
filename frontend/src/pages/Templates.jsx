import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PlusIcon,
    DocumentIcon,
    EyeIcon,
    TrashIcon,
    SparklesIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import UploadTemplateModal from '../components/UploadTemplateModal';
import UseTemplateModal from '../components/UseTemplateModal';
import VariablesEditorModal from '../components/VariablesEditorModal';
import TemplateVariablesHelp from '../components/TemplateVariablesHelp';
import ConfirmModal from '../components/ConfirmModal';
import { getTemplates, deleteTemplate } from '../api/templates';
import { useToast } from '../context/ToastContext';
import { usePermissions } from '../hooks/usePermissions';

function TemplateBadge({ isSystem }) {
    if (!isSystem) return null;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <SparklesIcon className="w-3 h-3" />
            Sistema
        </span>
    );
}

function VariablesBadge({ template }) {
    const count = template.variables?.length ?? 0;
    if (template.is_system) return null;
    return count > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            <PencilSquareIcon className="w-3 h-3" />
            {count} variable{count !== 1 ? 's' : ''}
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Sin variables
        </span>
    );
}

function TemplateCard({ template, onUse, onDelete, onEditVariables, isViewer }) {
    const noPermMsg = 'No tienes permisos para crear plantillas';
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <DocumentIcon className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h3>
                        <TemplateBadge isSystem={template.is_system} />
                        <VariablesBadge template={template} />
                    </div>
                    {template.description && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{template.description}</p>
                    )}
                    {!template.is_system && template.created_at && (
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(template.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <button
                    onClick={() => onUse(template)}
                    disabled={isViewer}
                    title={isViewer ? noPermMsg : undefined}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Usar plantilla
                </button>
                {template.preview_url && (
                    <a
                        href={template.preview_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <EyeIcon className="w-3.5 h-3.5" />
                        Vista previa
                    </a>
                )}
                {!template.is_system && (
                    <>
                        <button
                            onClick={() => onEditVariables(template)}
                            disabled={isViewer}
                            title={isViewer ? noPermMsg : 'Editar variables'}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(template)}
                            disabled={isViewer}
                            title={isViewer ? noPermMsg : 'Eliminar plantilla'}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function Templates() {
    const { isViewer }                          = usePermissions();
    const queryClient                           = useQueryClient();
    const [showUpload, setShowUpload]           = useState(false);
    const [useModal, setUseModal]               = useState(null);
    const [deleteTarget, setDeleteTarget]       = useState(null);
    const [editVarsTemplate, setEditVarsTemplate] = useState(null);
    const toast = useToast();

    const { data, isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn:  () => getTemplates().then((r) => r.data.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteTemplate(id),
        onSuccess:  () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success('Plantilla eliminada correctamente.');
        },
        onError: () => toast.error('No se pudo eliminar la plantilla.'),
    });

    const handleDelete = (template) => setDeleteTarget(template);

    const myTemplates     = data?.filter((t) => !t.is_system) ?? [];
    const systemTemplates = data?.filter((t) => t.is_system) ?? [];

    return (
        <Layout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Plantillas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Reutiliza documentos frecuentes o usa las plantillas prediseñadas del sistema.
                    </p>
                </div>
                <button
                    onClick={() => setShowUpload(true)}
                    disabled={isViewer}
                    title={isViewer ? 'No tienes permisos para crear plantillas' : undefined}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="w-4 h-4" />
                    Nueva plantilla
                </button>
            </div>

            <TemplateVariablesHelp />

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    <section className="mb-10">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Mis plantillas
                        </h2>
                        {myTemplates.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                                <DocumentIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-500">Aún no tienes plantillas</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Sube un PDF para reutilizarlo fácilmente.
                                </p>
                                <button
                                    onClick={() => setShowUpload(true)}
                                    disabled={isViewer}
                                    title={isViewer ? 'No tienes permisos para crear plantillas' : undefined}
                                    className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Subir primera plantilla
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myTemplates.map((t) => (
                                    <TemplateCard
                                        key={t.id}
                                        template={t}
                                        onUse={setUseModal}
                                        onDelete={handleDelete}
                                        onEditVariables={setEditVarsTemplate}
                                        isViewer={isViewer}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Plantillas del sistema
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {systemTemplates.map((t) => (
                                <TemplateCard
                                    key={t.id}
                                    template={t}
                                    onUse={setUseModal}
                                    onDelete={handleDelete}
                                    onEditVariables={setEditVarsTemplate}
                                    isViewer={isViewer}
                                />
                            ))}
                        </div>
                    </section>
                </>
            )}

            {showUpload && (
                <UploadTemplateModal
                    onClose={() => setShowUpload(false)}
                    onUploaded={(tpl) => setEditVarsTemplate(tpl)}
                />
            )}
            {useModal && <UseTemplateModal template={useModal} onClose={() => setUseModal(null)} />}
            {editVarsTemplate && (
                <VariablesEditorModal
                    template={editVarsTemplate}
                    onClose={() => setEditVarsTemplate(null)}
                    onSaved={() => setEditVarsTemplate(null)}
                />
            )}
            <ConfirmModal
                open={!!deleteTarget}
                title="Eliminar plantilla"
                message={deleteTarget ? `¿Eliminar la plantilla «${deleteTarget.name}»? Esta acción no se puede deshacer.` : ''}
                confirmLabel="Eliminar"
                loading={deleteMutation.isPending}
                onConfirm={() => { const id = deleteTarget.id; setDeleteTarget(null); deleteMutation.mutate(id); }}
                onCancel={() => setDeleteTarget(null)}
            />
        </Layout>
    );
}
