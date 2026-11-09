import React from 'react';

export function executeBold(
  editor: HTMLDivElement | null,
  emitChange: () => void
) {
  if (!editor) return;
  editor.focus();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);

  // If no text is selected (cursor only on line), select the current block/line
  if (range.collapsed) {
    let node: Node | null = range.startContainer;
    while (node && node.parentNode !== editor && node !== editor) {
      node = node.parentNode;
    }
    if (node && node !== editor) {
      const lineRange = document.createRange();
      lineRange.selectNodeContents(node);
      sel.removeAllRanges();
      sel.addRange(lineRange);
    }
  }

  document.execCommand('bold', false);
  emitChange();
}

export function executeBullet(
  editor: HTMLDivElement | null,
  emitChange: () => void
) {
  if (!editor) return;
  editor.focus();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  let node: Node | null = range.startContainer;
  while (node && node.parentNode !== editor && node !== editor) {
    node = node.parentNode;
  }

  if (!node || node === editor) {
    // Empty editor or root selection
    const div = document.createElement('div');
    div.innerHTML = '• &nbsp;';
    editor.appendChild(div);
    node = div;
  } else if (node.nodeType === Node.TEXT_NODE && node.parentNode === editor) {
    // Unwrapped text node at root
    const div = document.createElement('div');
    const text = (node.textContent || '').trim();
    if (text.startsWith('•')) {
      div.innerHTML = text.replace(/^•(&nbsp;|\s)*/, '') || '<br>';
    } else {
      div.innerHTML = `• &nbsp;${text}`;
    }
    editor.replaceChild(div, node);
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
}

export function handleEditorKeyDown(
  e: React.KeyboardEvent<HTMLDivElement>,
  editor: HTMLDivElement | null,
  emitChange: () => void,
  scrollToBottom: () => void
) {
  if (e.key === 'Enter') {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editor) return;

    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    while (node && node.parentNode !== editor && node !== editor) {
      node = node.parentNode;
    }

    if (node && node !== editor) {
      // If root text node, wrap in div for clean structure
      if (node.nodeType === Node.TEXT_NODE && node.parentNode === editor) {
        const wrapperDiv = document.createElement('div');
        editor.insertBefore(wrapperDiv, node);
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
          editor.insertBefore(newDiv, node.nextSibling);
        } else {
          editor.appendChild(newDiv);
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
        editor.insertBefore(newDiv, node.nextSibling);
      } else {
        editor.appendChild(newDiv);
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
    editor.appendChild(newDiv);
    const newRange = document.createRange();
    newRange.setStart(newDiv, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    emitChange();
    scrollToBottom();
  }
}

