import React from "react"

export function executeBold(
  editor: HTMLDivElement | null,
  emitChange: () => void
) {
  if (!editor) return
  editor.focus()

  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return

  const range = sel.getRangeAt(0)

  if (range.collapsed) {
    let node: Node | null = range.startContainer
    while (node && node.parentNode !== editor && node !== editor) {
      node = node.parentNode
    }
    if (node && node !== editor) {
      const lineRange = document.createRange()
      lineRange.selectNodeContents(node)
      sel.removeAllRanges()
      sel.addRange(lineRange)
    }
  }

  document.execCommand("bold", false)
  emitChange()
}

function findLineBlock(editor: HTMLDivElement, node: Node | null): HTMLElement | null {
  let curr = node
  while (curr && curr.parentNode !== editor && curr !== editor) {
    curr = curr.parentNode
  }
  if (!curr || curr === editor) return null
  if (curr.nodeType === Node.TEXT_NODE) {
    const wrapperDiv = document.createElement("div")
    editor.insertBefore(wrapperDiv, curr)
    wrapperDiv.appendChild(curr)
    return wrapperDiv
  }
  return curr instanceof HTMLElement ? curr : null
}

function normalizeEmptyLineHtml(el: HTMLElement): void {
  const hasText = (el.textContent || "").replace(/\u200B/g, "").length > 0
  if (!hasText) {
    el.innerHTML = "<br>"
  }
}

function moveCaretToStart(sel: Selection, target: HTMLElement): void {
  const newRange = document.createRange()
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT)
  const firstText = walker.nextNode()
  if (firstText) {
    newRange.setStart(firstText, 0)
  } else {
    newRange.setStart(target, 0)
  }
  newRange.collapse(true)
  sel.removeAllRanges()
  sel.addRange(newRange)
}

function stripLeadingBulletFromElement(el: HTMLElement): void {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let textNode = walker.nextNode() as Text | null
  while (textNode) {
    const val = textNode.nodeValue || ""
    if (!val.trim()) {
      textNode = walker.nextNode() as Text | null
      continue
    }
    textNode.nodeValue = val.replace(/^\s*(?:•|-|\*)\s*\u00A0*\s*/, "")
    break
  }
  normalizeEmptyLineHtml(el)
}

export function executeBullet(
  editor: HTMLDivElement | null,
  emitChange: () => void
) {
  if (!editor) return
  editor.focus()

  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return

  const lines = Array.from(editor.children) as HTMLElement[]
  for (const line of lines) {
    if (/^\s*•/.test(line.textContent || "")) {
      stripLeadingBulletFromElement(line)
    }
  }
  emitChange()
}

export function handleEditorKeyDown(
  e: React.KeyboardEvent<HTMLDivElement>,
  editor: HTMLDivElement | null,
  emitChange: () => void,
  scrollToBottom: () => void
) {
  if (e.key !== "Enter") return
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !editor) return

  e.preventDefault()

  const range = sel.getRangeAt(0)
  if (!range.collapsed) {
    range.deleteContents()
  }

  let lineEl = findLineBlock(editor, range.startContainer)
  if (!lineEl) {
    const newDiv = document.createElement("div")
    newDiv.innerHTML = "<br>"
    editor.appendChild(newDiv)
    moveCaretToStart(sel, newDiv)
    emitChange()
    scrollToBottom()
    return
  }

  // Extract trailing HTML/text from cursor position to end of current line block
  const tailRange = document.createRange()
  try {
    tailRange.setStart(range.startContainer, range.startOffset)
    tailRange.setEnd(lineEl, lineEl.childNodes.length)
  } catch {
    lineEl = findLineBlock(editor, editor.lastChild) || lineEl
    tailRange.selectNodeContents(lineEl)
    tailRange.collapse(false)
  }

  const trailingFragment = tailRange.extractContents()
  const newDiv = document.createElement("div")
  newDiv.appendChild(trailingFragment)

  // Clean stray BRs when non-empty text follows or normalize blank lines
  if ((newDiv.textContent || "").length > 0) {
    newDiv.querySelectorAll("br").forEach((br) => br.remove())
  }
  normalizeEmptyLineHtml(lineEl)
  normalizeEmptyLineHtml(newDiv)

  const wasLastLine = !lineEl.nextSibling
  if (lineEl.nextSibling) {
    editor.insertBefore(newDiv, lineEl.nextSibling)
  } else {
    editor.appendChild(newDiv)
  }

  moveCaretToStart(sel, newDiv)
  emitChange()
  if (wasLastLine) {
    scrollToBottom()
  }
}
