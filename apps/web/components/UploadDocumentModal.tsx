"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDocumentAction } from '@/app/actions/documents';
import { toast } from 'sonner';

interface UploadDocumentModalProps {
    matterId: string;
    parentVersionId?: string;
    buttonText?: string;
    onSuccess?: () => void;
}

export default function UploadDocumentModal({ matterId, parentVersionId, buttonText, onSuccess }: UploadDocumentModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[Upload] Iniciando submissão...', { file: file?.name, size: file?.size, matterId });
        
        if (!file) {
            toast.error('Por favor, selecione um ficheiro primeiro.');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('A preparar upload...');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('matterId', matterId);
            formData.append('title', file.name);
            if (parentVersionId) formData.append('parentVersionId', parentVersionId);

            console.log('[Upload] Chamando Server Action uploadDocumentAction...');
            const result = await uploadDocumentAction(formData);
            
            if (result.error) {
                console.error('[Upload] Erro retornado pela action:', result.error);
                toast.error(result.error, { id: toastId });
            } else {
                console.log('[Upload] Sucesso:', result);
                toast.success(parentVersionId ? 'Nova versão carregada com sucesso!' : 'Documento carregado com sucesso!', { id: toastId });
                setIsOpen(false);
                setFile(null);
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            console.error('[Upload] Erro catastrófico na submissão:', error);
            toast.error(`Erro inesperado: ${error.message || 'Falha na conexão'}`, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const modalContent = isOpen && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
            <div className="glass-panel border-white/10 w-full max-w-md shadow-premium my-auto animate-in zoom-in-95 duration-300">
                <div className="bg-white/5 p-5 flex justify-between items-center border-b border-white/5">
                    <h2 className="text-white font-display font-black uppercase tracking-widest text-sm flex items-center gap-3">
                        <div className="p-2 bg-amber/20 rounded-lg">
                            <Upload size={16} className="text-amber" />
                        </div>
                        {parentVersionId ? 'Upload de Nova Versão' : 'Upload de Documento'}
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-all rounded-2xl group ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-amber/50 bg-white/5'}`}
                    >
                        <label htmlFor="file-upload" className="sr-only">Carregar Documento</label>
                        <input
                            id="file-upload"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            aria-label="Upload de documento"
                        />

                        {file ? (
                            <>
                                <div className="p-4 bg-emerald-500/20 rounded-full mb-3">
                                    <CheckCircle2 className="text-emerald-400" size={32} />
                                </div>
                                <span className="text-sm font-bold text-white text-center truncate max-w-full">
                                    {file.name}
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase mt-1 tracking-widest">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-white/5 rounded-full mb-3 group-hover:bg-amber/10 transition-colors">
                                    <Upload className="text-slate-500 group-hover:text-amber" size={32} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter group-hover:text-white transition-colors">Clique para selecionar</span>
                                <span className="text-[10px] text-slate-600 mt-1 italic font-medium">PDF, DOCX, PNG até 10MB</span>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-amber/5 border border-amber/20 text-amber/80 text-[10px] uppercase font-bold leading-tight rounded-xl">
                            <AlertCircle size={18} className="shrink-0 text-amber" />
                            <p>O documento será processado pelo sistema de IA para indexação automática e pesquisa semântica.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="btn-premium btn-premium-outline flex-1 py-4 text-xs font-bold uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="btn-premium btn-premium-primary flex-1 py-4 text-xs font-bold uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    A Enviar...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Submeter
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`btn-premium btn-premium-primary text-[10px] uppercase w-full flex items-center justify-center gap-2 ${parentVersionId ? 'hidden' : ''}`}
            >
                <Upload size={14} /> {buttonText || 'Adicionar Ficheiro'}
            </button>

            {mounted && isOpen && createPortal(modalContent, document.getElementById('modal-root') || document.body)}
        </>
    );
}
