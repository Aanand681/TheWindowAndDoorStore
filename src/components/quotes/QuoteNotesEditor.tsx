"use client"

import React, { useRef, useEffect } from "react"
import { Bold, List } from "lucide-react"
import {
  executeBold,
  executeBullet,
  handleEditorKeyDown,
} from "./notes/notes-editor-helpers"

interface QuoteNotesEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  id?: string
  className?: string
  readOnly?: boolean
}

export default function QuoteNotesEditor({
  value,
  onChange,
  placeholder = "Enter special site notes, instructions, or employee comments...",
  id = "quoteNotesEditor",
  className = "",
  readOnly = false,
}: QuoteNotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalUpdateRef = useRef(false)

  // Initialize or update HTML when value changes externally
  useEffect(() => {
    if (!editorRef.current) return
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false
      return
    }

    // Convert plain text with newlines to clean HTML if needed
    const currentHtml = editorRef.current.innerHTML
    let targetHtml = value || ""

    // If external value doesn't contain HTML tags, convert newlines to divs
    if (targetHtml && !/<[a-z][\s\S]*>/i.test(targetHtml)) {
      targetHtml = targetHtml
        .split("\n")
        .map(
          (line) =>
            `<div>${line ? line.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") : "<br>"}</div>`
        )
        .join("")
    }

    if (currentHtml !== targetHtml) {
      editorRef.current.innerHTML = targetHtml
    }
  }, [value])

  const emitChange = () => {
    if (!editorRef.current) return
    const text = (
      editorRef.current.innerText ||
      editorRef.current.textContent ||
      ""
    ).trim()
    if (!text) {
      if (editorRef.current.innerHTML !== "") {
        editorRef.current.innerHTML = ""
      }
      isInternalUpdateRef.current = true
      onChange("")
      return
    }
    isInternalUpdateRef.current = true
    onChange(editorRef.current.innerHTML)
  }

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.scrollTop = editorRef.current.scrollHeight
      }
    })
  }

  return (
    <div className="w-full space-y-1.5">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          Quote Notes &amp; Comments
        </label>
        {!readOnly && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                executeBold(editorRef.current, emitChange)
              }}
              title="Make current line or selection bold (No asterisks)"
              className="inline-flex cursor-pointer items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground transition-colors select-none hover:bg-primary/10 hover:text-primary"
            >
              <Bold className="h-3 w-3 cursor-pointer" />
              <span className="cursor-pointer">Bold</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                executeBullet(editorRef.current, emitChange)
              }}
              title="Add or toggle bullet point (• line)"
              className="inline-flex cursor-pointer items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground transition-colors select-none hover:bg-primary/10 hover:text-primary"
            >
              <List className="h-3 w-3 cursor-pointer" />
              <span className="cursor-pointer">Bullet</span>
            </button>
          </div>
        )}
      </div>

      {/* Auto-growing Rich Editor Container */}
      <div
        id={id}
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={() => {
          if (readOnly) return
          emitChange()
          scrollToBottom()
        }}
        onKeyDown={
          readOnly
            ? undefined
            : (e) =>
                handleEditorKeyDown(
                  e,
                  editorRef.current,
                  emitChange,
                  scrollToBottom
                )
        }
        data-placeholder={readOnly ? "No notes provided" : placeholder}
        className={`max-h-[135px] min-h-[56px] w-full overflow-y-auto rounded-lg border border-border p-2.5 text-xs ${
          readOnly
            ? "cursor-default bg-muted/40 opacity-90"
            : "bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none"
        } leading-snug break-words text-[#0f172a] transition-all outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] dark:text-[#f8fafc] [&_div]:m-0 [&_div]:min-h-[1.2em] [&_div]:p-0 [&_p]:m-0 [&_p]:p-0 ${className}`}
      />

      {!readOnly && (
        <div className="text-[10px] text-muted-foreground">
          Tip: Click <strong className="text-foreground">Bold</strong> to make
          the line bold (no asterisks). Click{" "}
          <strong className="text-foreground">Bullet</strong> for lists. Scrolls
          after 5–6 lines.
        </div>
      )}
    </div>
  )
}
