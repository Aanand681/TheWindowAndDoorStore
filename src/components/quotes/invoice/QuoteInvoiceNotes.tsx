import React from "react"
import { FileText } from "lucide-react"

export interface QuoteInvoiceNotesProps {
  notes?: string
  noteFs?: number
  rowPy?: number
  variant?: "default" | "paper-rows"
}

function parseFormattedNoteLine(cleanText: string): React.ReactNode {
  const parts = cleanText.split(
    /(\*\*[^*]+\*\*|<b>.*?<\/b>|<strong>.*?<\/strong>)/gi
  )
  return parts.map((part, pIdx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={pIdx}
          className="font-bold text-[#0f172a] print:text-black"
        >
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (
      part.toLowerCase().startsWith("<b>") &&
      part.toLowerCase().endsWith("</b>")
    ) {
      return (
        <strong
          key={pIdx}
          className="font-bold text-[#0f172a] print:text-black"
        >
          {part.slice(3, -4)}
        </strong>
      )
    }
    if (
      part.toLowerCase().startsWith("<strong>") &&
      part.toLowerCase().endsWith("</strong>")
    ) {
      return (
        <strong
          key={pIdx}
          className="font-bold text-[#0f172a] print:text-black"
        >
          {part.slice(8, -9)}
        </strong>
      )
    }
    return <span key={pIdx}>{part}</span>
  })
}

export function QuoteInvoiceNotes({
  notes,
  noteFs = 9.5,
  rowPy = 3,
  variant = "default",
}: QuoteInvoiceNotesProps) {
  if (!notes || !notes.trim()) return null

  // 1. Normalize line breaks across HTML tags
  const cleaned = notes
    .replace(/<br\s*\/?>\s*<\/(div|p|li)>/gi, "</$1>")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li)>/gi, "\n")
    .replace(/([^\n])<(div|p|li)[^>]*>/gi, "$1\n")
    .replace(/<(div|p|li)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")

  const rawLines = cleaned.split("\n")

  let start = 0
  while (start < rawLines.length && !rawLines[start].trim()) {
    start++
  }
  let end = rawLines.length - 1
  while (end >= 0 && !rawLines[end].trim()) {
    end--
  }

  const lines: string[] = []
  for (let i = start; i <= end; i++) {
    lines.push(rawLines[i].trim())
  }

  if (lines.length === 0) return null

  if (variant === "paper-rows") {
    const renderedRows = lines
      .map((line, idx) => {
        if (!line) return null
        const stripped = line.replace(/<(?!\/?(b|strong)\b)[^>]+>/gi, "").trim()
        if (!stripped) return null
        // Strip legacy bullet tokens (including inside leading <b>/<strong> tags) cleanly
        const withoutLeadingBullet = stripped
          .replace(/^((?:<b>|<strong>)\s*)(?:•|-|\*)\s*/i, "$1")
          .replace(/^(?:•|-|\*)\s*/, "")
          .trim()
        if (!withoutLeadingBullet || withoutLeadingBullet === "<b></b>" || withoutLeadingBullet === "<strong></strong>") {
          return null
        }

        return (
          <div
            key={idx}
            style={{ fontSize: `${noteFs}px`, padding: `${Math.max(2, rowPy)}px 7px` }}
            className="flex items-start gap-1.5 bg-[#f8fafc] leading-snug text-[#334155]"
          >
            <FileText className="mt-0.5 h-3 w-3 shrink-0 text-[#475569]" />
            <div className="min-w-0 flex-1 italic leading-snug">
              {parseFormattedNoteLine(withoutLeadingBullet)}
            </div>
          </div>
        )
      })
      .filter(Boolean)

    if (renderedRows.length === 0) return null
    return (
      <div className="divide-y divide-[#e2e8f0] overflow-hidden rounded border border-[#cbd5e1] bg-[#f8fafc]">
        {renderedRows}
      </div>
    )
  }

  return (
    <div
      className="space-y-0.5 font-sans leading-snug text-[#0f172a]"
      style={{ fontSize: `${noteFs}px` }}
    >
      {lines.map((line, idx) => {
        if (!line) {
          return <div key={idx} className="h-1.5" />
        }

        const stripped = line.replace(/<(?!\/?(b|strong)\b)[^>]+>/gi, "").trim()
        if (!stripped) return null

        const isBullet = /^(<b>|<strong>)?\s*(•|-|\*)\s*/i.test(stripped)
        let cleanText = stripped
        if (isBullet) {
          cleanText = cleanText.replace(/^(<b>|<strong>)\s*(•|-|\*)\s*/i, "$1")
          cleanText = cleanText.replace(/^(•|-|\*)\s*/, "")
        }

        const parsedContent = parseFormattedNoteLine(cleanText)

        if (isBullet) {
          return (
            <div
              key={idx}
              className="flex items-start gap-1.5 pl-0.5 leading-snug"
            >
              <span className="font-bold text-[#0f172a] select-none print:text-black">
                •
              </span>
              <div className="flex-1 leading-snug">{parsedContent}</div>
            </div>
          )
        }

        return (
          <div key={idx} className="leading-snug">
            {parsedContent}
          </div>
        )
      })}
    </div>
  )
}

export default QuoteInvoiceNotes
