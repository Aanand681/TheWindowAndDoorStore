'use client';

import React, { useRef, useEffect } from 'react';
import { Bold, List } from 'lucide-react';

interface QuoteNotesEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export default function QuoteNotesEditor({
  value,
  onChange,
  placeholder = 'Enter special site notes, instructions, or employee comments...',
  id = 'quoteNotesEditor',
  className = '',
}: QuoteNotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdateRef = useRef(false);

  // Initialize or update HTML when value changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    // Convert plain text with newlines to clean HTML if needed
    const currentHtml = editorRef.current.innerHTML;
    let targetHtml = value || '';

    // If external value doesn't contain HTML tags, convert newlines to divs
    if (targetHtml && !/<[a-z][\s\S]*>/i.test(targetHtml)) {
      targetHtml = targetHtml
        .split('\n')
        .map((line) => `<div>${line ? line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') : '<br>'}</div>`)
        .join('');
    }

    if (currentHtml !== targetHtml) {
      editorRef.current.innerHTML = targetHtml;
    }
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current) return;
    const text = (editorRef.current.innerText || editorRef.current.textContent || '').trim();
    if (!text) {
      if (editorRef.current.innerHTML !== '') {
        editorRef.current.innerHTML = '';
      }
      isInternalUpdateRef.current = true;
      onChange('');
      return;
    }
    isInternalUpdateRef.current = true;
    onChange(editorRef.current.innerHTML);
  };

  const handleBold = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    // If no text is selected (cursor only on line), select the current block/line
    if (range.collapsed) {
      let node: Node | null = range.startContainer;
      while (node && node.parentNode !== editorRef.current && node !== editorRef.current) {
        node = node.parentNode;
      }
      if (node && node !== editorRef.current) {
        const lineRange = document.createRange();
        lineRange.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(lineRange);
      }
    }

    document.execCommand('bold', false);
    emitChange();
  };

  const handleBullet = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    while (node && node.parentNode !== editorRef.current && node !== editorRef.current) {
      node = node.parentNode;
    }

    if (!node || node === editorRef.current) {
      // Empty editor or root selection
      const div = document.createElement('div');
      div.innerHTML = '• &nbsp;';
      editorRef.current.appendChild(div);
      node = div;
    } else if (node.nodeType === Node.TEXT_NODE && node.parentNode === editorRef.current) {
      // Unwrapped text node at root
      const div = document.createElement('div');
      const text = (node.textContent || '').trim();
      if (text.startsWith('•')) {
        div.innerHTML = text.replace(/^•(&nbsp;|\s)*/, '') || '<br>';
      } else {
        div.innerHTML = `• &nbsp;${text}`;
      }
      editorRef.current.replaceChild(div, node);
      node = div;
    } else if (node instanceof HTMLElement) {
      const text = (node.innerText || node.textContent || '').trim();
      if (text.startsWith('•')) {
        // Toggle bullet off
        node.innerHTML = node.innerHTML.replace(/^•(&nbsp;|\s)*/, '');
        if (!node.innerHTML.trim()) {
          node.innerHTML = '<br>';
        }
      } else {
        // Toggle bullet on: clear lone <br> if empty line
        const inner = node.innerHTML.replace(/^<br\s*\/?>$/i, '');
        node.innerHTML = `• &nbsp;${inner}`;
      }
    }

    // Always reposition cursor right AFTER the bullet at the end of the line
    if (node) {
      const newRange = document.createRange();
      newRange.selectNodeContents(node);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    emitChange();
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.scrollTop = editorRef.current.scrollHeight;
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return;

      const range = sel.getRangeAt(0);
      let node: Node | null = range.startContainer;
      while (node && node.parentNode !== editorRef.current && node !== editorRef.current) {
        node = node.parentNode;
      }

      if (node && node !== editorRef.current) {
        // If root text node, wrap in div for clean structure
        if (node.nodeType === Node.TEXT_NODE && node.parentNode === editorRef.current) {
          const wrapperDiv = document.createElement('div');
          editorRef.current.insertBefore(wrapperDiv, node);
          wrapperDiv.appendChild(node);
          node = wrapperDiv;
        }

        const text = (node.textContent || '').trim();
        // If on an empty bullet line, exit bullet mode cleanly
        if (text === '•' || text === '• ' || text === '•\u00A0') {
          e.preventDefault();
          if (node instanceof HTMLElement) {
            node.innerHTML = '<br>';
          } else {
            node.textContent = '';
          }
          const newRange = document.createRange();
          newRange.selectNodeContents(node);
          newRange.collapse(false);
          sel.removeAllRanges();
          sel.addRange(newRange);
          emitChange();
          return;
        }

        // If on an active bullet line, insert bullet point on the next line
        if (text.startsWith('•')) {
          e.preventDefault();
          const newDiv = document.createElement('div');
          newDiv.innerHTML = '• &nbsp;';
          if (node.nextSibling) {
            editorRef.current.insertBefore(newDiv, node.nextSibling);
          } else {
            editorRef.current.appendChild(newDiv);
          }
          const newRange = document.createRange();
          newRange.selectNodeContents(newDiv);
          newRange.collapse(false);
          sel.removeAllRanges();
          sel.addRange(newRange);
          emitChange();
          scrollToBottom();
          return;
        }

        // Normal line: insert a single line break without skipping any line
        e.preventDefault();
        const newDiv = document.createElement('div');
        newDiv.innerHTML = '<br>';
        if (node.nextSibling) {
          editorRef.current.insertBefore(newDiv, node.nextSibling);
        } else {
          editorRef.current.appendChild(newDiv);
        }
        const newRange = document.createRange();
        newRange.setStart(newDiv, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        emitChange();
        scrollToBottom();
        return;
      }

      // Root level Enter
      e.preventDefault();
      const newDiv = document.createElement('div');
      newDiv.innerHTML = '<br>';
      editorRef.current.appendChild(newDiv);
      const newRange = document.createRange();
      newRange.setStart(newDiv, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      emitChange();
      scrollToBottom();
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs text-muted-foreground font-medium">
          Quote Notes &amp; Comments
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={handleBold}
            title="Make current line or selection bold (No asterisks)"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-muted hover:bg-primary/10 hover:text-primary border border-border text-foreground transition-colors cursor-pointer select-none"
          >
            <Bold className="w-3 h-3 cursor-pointer" />
            <span className="cursor-pointer">Bold</span>
          </button>
          <button
            type="button"
            onMouseDown={handleBullet}
            title="Add or toggle bullet point (• line)"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted hover:bg-primary/10 hover:text-primary border border-border text-foreground transition-colors cursor-pointer select-none"
          >
            <List className="w-3 h-3 cursor-pointer" />
            <span className="cursor-pointer">Bullet</span>
          </button>
        </div>
      </div>

      {/* Auto-growing Rich Editor Container (Max 5-6 lines with vertical scroll & single-spaced enter) */}
      <div
        id={id}
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          emitChange();
          scrollToBottom();
        }}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`w-full min-h-[56px] max-h-[135px] overflow-y-auto text-xs p-2.5 rounded-lg border border-border bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none transition-all outline-none leading-snug text-[#0f172a] dark:text-[#f8fafc] break-words [&_div]:m-0 [&_div]:p-0 [&_div]:min-h-[1.2em] [&_p]:m-0 [&_p]:p-0 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none ${className}`}
      />

      <div className="text-[10px] text-muted-foreground">
        Tip: Click <strong className="text-foreground">Bold</strong> to make the line bold (no asterisks). Click <strong className="text-foreground">Bullet</strong> for lists. Scrolls after 5–6 lines.
      </div>
    </div>
  );
}
