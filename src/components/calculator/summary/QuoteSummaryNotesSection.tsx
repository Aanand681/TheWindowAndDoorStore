import React from "react"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"
import QuoteNotesEditor from "@/components/quotes/QuoteNotesEditor"

export interface QuoteSummaryNotesSectionProps {
  quoteNotes: string
  setQuoteNotes: (val: string) => void
  isReadOnly?: boolean
}

export function QuoteSummaryNotesSection({
  quoteNotes,
  setQuoteNotes,
  isReadOnly = false,
}: QuoteSummaryNotesSectionProps) {
  return (
    <div className="mt-3 space-y-1.5 border-t border-border/40 pt-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="windowQuoteNotes"
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span>Special Notes &amp; Instructions</span>
        </Label>
        <span className="text-[10px] text-muted-foreground">
          Printed on PDF quotation
        </span>
      </div>
      <QuoteNotesEditor
        id="windowQuoteNotes"
        value={quoteNotes}
        onChange={setQuoteNotes}
        readOnly={isReadOnly}
        placeholder="Enter special site notes, instructions, or employee comments with bold text and bullets..."
      />
    </div>
  )
}
