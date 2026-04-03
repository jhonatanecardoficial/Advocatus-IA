"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Quote, Undo, Redo, 
  Save, Sparkles, Wand2, X, Maximize2, Minimize2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface DocumentEditorProps {
  initialContent: string;
  title: string;
  onSave?: (content: string) => void;
  onClose?: () => void;
  onRefine?: (content: string, instruction: string) => Promise<string>;
}

export default function DocumentEditor({ 
  initialContent, 
  title, 
  onSave, 
  onClose,
  onRefine 
}: DocumentEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [refineValue, setRefineValue] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Comece a redigir a sua peça processual aqui...',
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });

  // Update content if initialContent changes (e.g. after AI generation)
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  const handleRefine = async () => {
    if (!onRefine || !refineValue) return;
    setIsRefining(true);
    try {
      const currentContent = editor.getText();
      const newContent = await onRefine(currentContent, refineValue);
      editor.commands.setContent(newContent);
      setRefineValue('');
    } catch (err) {
      console.error('Refine error:', err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <motion.div 
      layout
      className={`flex flex-col bg-navy/90 backdrop-blur-2xl border border-white/10 shadow-premium overflow-hidden transition-all duration-500 ${
        isFullScreen ? 'fixed inset-4 z-[110] rounded-3xl' : 'h-full rounded-2xl'
      }`}
    >
      {/* Editor Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber/10 rounded-lg">
            <Sparkles size={18} className="text-amber" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">{title}</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase">Editor Inteligente Advocatus</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isFullScreen ? "Sair de Ecrã Inteiro" : "Ecrã Inteiro"}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-white/5 bg-white/[0.01] flex flex-wrap items-center gap-1 shrink-0">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`editor-toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`editor-toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`editor-toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
        >
          <UnderlineIcon size={16} />
        </button>
        
        <div className="w-[1px] h-6 bg-white/5 mx-2" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`editor-toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`editor-toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`editor-toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        >
          <Quote size={16} />
        </button>

        <div className="w-[1px] h-6 bg-white/5 mx-2" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="editor-toolbar-btn"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="editor-toolbar-btn"
        >
          <Redo size={16} />
        </button>

        <div className="flex-1" />

        {onSave && (
          <button 
            onClick={() => onSave(editor.getHTML())}
            className="flex items-center gap-2 px-4 py-2 bg-amber text-navy rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,175,41,0.3)]"
          >
            <Save size={14} /> Guardar Peça
          </button>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
        <EditorContent editor={editor} />
      </div>

      {/* AI Refinement Footer */}
      {onRefine && (
        <div className="p-4 border-t border-white/5 bg-navy/50 backdrop-blur-xl shrink-0">
           <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber/30 to-blue-500/30 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex gap-3">
                <input 
                  type="text"
                  value={refineValue}
                  onChange={(e) => setRefineValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  placeholder="Instruções para a IA (ex: 'Melhorar formalidade', 'Citar Artigo 10.º da Lei da Nacionalidade'...)"
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-5 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber/50 transition-all"
                />
                <button 
                  onClick={handleRefine}
                  disabled={isRefining || !refineValue}
                  className="px-6 flex items-center justify-center bg-white/5 hover:bg-amber hover:text-navy rounded-xl text-amber border border-white/10 transition-all disabled:opacity-20 font-bold text-[10px] uppercase tracking-widest"
                >
                  {isRefining ? 'A processar...' : 'Refinar com IA'}
                  {!isRefining && <Wand2 size={14} className="ml-2" />}
                </button>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
}
