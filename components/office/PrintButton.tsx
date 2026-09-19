"use client";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-line btn-sm">
      <Printer className="h-4 w-4" /> Print or save as PDF
    </button>
  );
}
