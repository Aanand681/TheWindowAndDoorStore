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

function normalizeLines(editor: HTMLDivElement): HTMLElement[] {
  const childNodes = Array.from(editor.childNodes);
  if (childNodes.length === 0) {
    const div = document.createElement('div');
    div.innerHTML = '<br>';
    editor.appendChild(div);
    return [div];
  }

  for (const child of childNodes) {
    if (child instanceof HTMLElement && (child.tagName === 'DIV' || child.tagName === 'P')) {
      continue;
    }
    const div = document.createElement('div');
    editor.insertBefore(div, child);
    div.appendChild(child);
  }

  return Array.from(editor.children) as HTMLElement[];
}

function getSelectedLineElements(editor: HTMLDivElement, range: Range): HTMLElement[] {
  const lines = normalizeLines(editor);
  if (lines.length === 0) return [];

  if (range.collapsed) {
    let node: Node | null = range.startContainer;
    while (node && node.parentElement !== editor && node !== editor) {
      node = node.parentElement;
    }
    if (node instanceof HTMLElement && node !== editor) {
      return [node];
    }
    return [lines[0]];
  }

  let startLine: HTMLElement | null = null;
  let node: Node | null = range.startContainer;
  while (node && node.parentElement !== editor && node !== editor) {
    node = node.parentElement;
  }
  if (node instanceof HTMLElement && node !== editor) {
    startLine = node;
  }

  let endLine: HTMLElement | null = null;
  node = range.endContainer;
  while (node && node.parentElement !== editor && node !== editor) {
    node = node.parentElement;
  }
  if (node instanceof HTMLElement && node !== editor) {
    endLine = node;
  }

  if (startLine && endLine) {
    const sIdx = lines.indexOf(startLine);
    const eIdx = lines.indexOf(endLine);
    if (sIdx !== -1 && eIdx !== -1) {
      const min = Math.min(sIdx, eIdx);
      const max = Math.max(sIdx, eIdx);
      return lines.slice(min, max + 1);
    }
  }

  const intersected = lines.filter((line) => {
    try {
      return range.intersectsNode(line);
    } catch {
      return false;
    }
  });

  return intersected.length > 0 ? intersected : lines;
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
  const selectedLines = getSelectedLineElements(editor, range);
  if (selectedLines.length === 0) return;

  // Check if ALL non-empty selected lines already have a bullet
  const nonEmpties = selectedLines.filter((l) => (l.textContent || '').trim().length > 0);
  const allBulleted =
    nonEmpties.length > 0 &&
    nonEmpties.every((l) => (l.textContent || '').trim().startsWith('•'));

  for (const line of selectedLines) {
    const text = (line.textContent || '').trim();
    if (allBulleted) {
      line.innerHTML = line.innerHTML.replace(/^•(&nbsp;|\s)*/, '');
      if (!line.innerHTML.trim()) {
        line.innerHTML = '<br>';
      }
    } else {
      if (!text.startsWith('•')) {
        const inner = line.innerHTML.replace(/^<br\s*\/?>$/i, '');
        line.innerHTML = `• &nbsp;${inner}`;
      }
    }
  }

  if (range.collapsed) {
    const target = selectedLines[0];
    if (target) {
      const newRange = document.createRange();
      newRange.selectNodeContents(target);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  } else {
    const first = selectedLines[0];
    const last = selectedLines[selectedLines.length - 1];
    if (first && last) {
      const newRange = document.createRange();
      newRange.setStart(first, 0);
      newRange.setEnd(last, last.childNodes.length);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
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

