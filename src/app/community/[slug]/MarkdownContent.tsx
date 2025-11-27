"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface MarkdownContentProps {
  content: string
}

// Simple markdown renderer
function parseMarkdown(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  const lines = text.split("\n")
  let inCodeBlock = false
  let codeLines: string[] = []
  let codeLanguage = ""
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block handling
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
        codeLines = []
      } else {
        elements.push(
          <CodeBlock key={key++} code={codeLines.join("\n")} language={codeLanguage} />
        )
        inCodeBlock = false
        codeLines = []
        codeLanguage = ""
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="font-mono text-lg text-slate-900 mt-6 mb-2">
          {line.slice(4)}
        </h3>
      )
      continue
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="font-mono text-xl text-slate-900 mt-6 mb-3">
          {line.slice(3)}
        </h2>
      )
      continue
    }

    // Lists
    if (line.match(/^[-*]\s/)) {
      elements.push(
        <li
          key={key++}
          className="text-slate-600 ml-4"
          dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }}
        />
      )
      continue
    }

    if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li
          key={key++}
          className="text-slate-600 ml-4 list-decimal"
          dangerouslySetInnerHTML={{
            __html: formatInline(line.replace(/^\d+\.\s/, "")),
          }}
        />
      )
      continue
    }

    // Empty line = paragraph break
    if (line.trim() === "") {
      elements.push(<br key={key++} />)
      continue
    }

    // Regular paragraph
    elements.push(
      <p
        key={key++}
        className="text-slate-600 mb-3"
        dangerouslySetInnerHTML={{ __html: formatInline(line) }}
      />
    )
  }

  return elements
}

// Format inline elements (bold, italic, code, links)
function formatInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sm text-slate-800">$1</code>'
    )
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-700 hover:underline">$1</a>'
    )
}

// Code block with copy button
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded border border-slate-200 overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="text-sm font-mono text-slate-500">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <pre className="p-4 bg-slate-50 overflow-x-auto">
        <code className="text-sm font-mono text-slate-800">{code}</code>
      </pre>
    </div>
  )
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const elements = parseMarkdown(content)

  return <div className="prose prose-slate max-w-none">{elements}</div>
}
