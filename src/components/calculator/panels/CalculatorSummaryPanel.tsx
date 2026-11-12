"use client"

import React from "react"
import {
  QuoteSummaryCard,
  QuoteSummaryCardProps,
} from "@/components/calculator/QuoteSummaryCard"

export function CalculatorSummaryPanel(props: QuoteSummaryCardProps) {
  return <QuoteSummaryCard {...props} />
}
