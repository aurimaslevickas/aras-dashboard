import React, { useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, List, AlignLeft, Heading2, Heading3, Link as LinkIcon, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

const ToolbarButton = ({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, rows = 8, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      const current = editorRef.current.innerHTML;
      const normalized = value || '';
      if (current !== normalized) {
        editorRef.current.innerHTML = normalized;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const insertLink = useCallback(() => {
    const url = prompt('Įveskite nuorodą (URL):');
    if (url) exec('createLink', url);
  }, [exec]);

  const minHeight = `${rows * 1.6}rem`;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <ToolbarButton onClick={() => exec('bold')} title="Paryškintas (Ctrl+B)">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Kursyvas (Ctrl+I)">
          <Italic size={15} />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => exec('formatBlock', 'h2')} title="Antraštė H2">
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', 'h3')} title="Antraštė H3">
          <Heading3 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', 'p')} title="Paprastas tekstas">
          <AlignLeft size={15} />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Sąrašas">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={insertLink} title="Nuoroda">
          <LinkIcon size={15} />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => exec('undo')} title="Atšaukti (Ctrl+Z)">
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('redo')} title="Grąžinti (Ctrl+Y)">
          <Redo size={15} />
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder || 'Įveskite aprašymą...'}
        style={{ minHeight }}
        className="px-4 py-3 text-sm text-gray-800 outline-none overflow-y-auto prose prose-sm max-w-none
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1
          [&_a]:text-amber-600 [&_a]:underline
          [&_p]:my-1
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
      />
    </div>
  );
};

export default RichTextEditor;
