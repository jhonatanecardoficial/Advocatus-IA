"use client";

import { useState, useRef } from 'react';
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
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('matterId', matterId);
        formData.append('title', file.name);
        if (parentVersionId) formData.append('parentVersionId', parentVersionId);

        try {
            const result = await uploadDocumentAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(parentVersionId ? 'Nova versão carregada com sucesso!' : 'Documento carregado com sucesso!');
                setIsOpen(false);
                setFile(null);
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            toast.error('Erro ao conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-colors ${parentVersionId ? 'hidden' : ''}`}
            >
                <Upload size={14} /> {buttonText || 'Adicionar Ficheiro'}
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-4 border-navy w-full max-w-md shadow-[8px_8px_0px_#D4A853] animate-in zoom-in-95 duration-200">
                        <div className="bg-navy p-4 flex justify-between items-center">
                            <h2 className="text-white font-display font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                <Upload size={16} className="text-amber-400" />
                                {parentVersionId ? 'Upload de Nova Versão' : 'Upload de Documento'}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-amber transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-navy bg-slate-50'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {file ? (
                                    <>
                                        <CheckCircle2 className="text-green-500 mb-2" size={32} />
                                        <span className="text-sm font-bold text-navy text-center truncate max-w-full">
                                            {file.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase mt-1">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="text-slate-300 mb-2" size={32} />
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Clique para selecionar</span>
                                        <span className="text-[10px] text-slate-400 mt-1 italic">PDF, DOCX, PNG até 10MB</span>
                                    </>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] uppercase font-bold leading-tight">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <p>O documento será processado pelo sistema de IA para indexação automática e pesquisa semântica.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest text-navy bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !file}
                                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest bg-navy text-white hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            A Enviar...
                                        </>
                                    ) : (
                                        'Submeter'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
