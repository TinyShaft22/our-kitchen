import { useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

type FormatType = 'bold' | 'italic' | 'strikethrough' | 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'quote';

const formatButtons: { type: FormatType; label: string; icon: string; title: string }[] = [
  { type: 'h1', label: 'H1', icon: 'H1', title: 'Heading 1' },
  { type: 'h2', label: 'H2', icon: 'H2', title: 'Heading 2' },
  { type: 'h3', label: 'H3', icon: 'H3', title: 'Heading 3' },
  { type: 'h4', label: 'H4', icon: 'H4', title: 'Heading 4' },
  { type: 'bold', label: 'B', icon: 'B', title: 'Bold' },
  { type: 'italic', label: 'I', icon: 'I', title: 'Italic' },
  { type: 'strikethrough', label: 'S', icon: 'S̶', title: 'Strikethrough' },
  { type: 'ul', label: '•', icon: '•', title: 'Bullet List' },
  { type: 'ol', label: '1.', icon: '1.', title: 'Numbered List' },
  { type: 'quote', label: '"', icon: '"', title: 'Quote' },
];

export function MarkdownEditor({ value, onChange, placeholder, rows = 6 }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (type: FormatType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let newText = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        if (selectedText) {
          newText = `${beforeText}**${selectedText}**${afterText}`;
          cursorOffset = end + 4;
        } else {
          newText = `${beforeText}**text**${afterText}`;
          cursorOffset = start + 2;
        }
        break;

      case 'italic':
        if (selectedText) {
          newText = `${beforeText}*${selectedText}*${afterText}`;
          cursorOffset = end + 2;
        } else {
          newText = `${beforeText}*text*${afterText}`;
          cursorOffset = start + 1;
        }
        break;

      case 'strikethrough':
        if (selectedText) {
          newText = `${beforeText}~~${selectedText}~~${afterText}`;
          cursorOffset = end + 4;
        } else {
          newText = `${beforeText}~~text~~${afterText}`;
          cursorOffset = start + 2;
        }
        break;

      case 'h1':
        newText = insertAtLineStart(beforeText, selectedText || 'Heading', afterText, '# ');
        cursorOffset = start + 2 + (selectedText ? selectedText.length : 7);
        break;

      case 'h2':
        newText = insertAtLineStart(beforeText, selectedText || 'Heading', afterText, '## ');
        cursorOffset = start + 3 + (selectedText ? selectedText.length : 7);
        break;

      case 'h3':
        newText = insertAtLineStart(beforeText, selectedText || 'Heading', afterText, '### ');
        cursorOffset = start + 4 + (selectedText ? selectedText.length : 7);
        break;

      case 'h4':
        newText = insertAtLineStart(beforeText, selectedText || 'Heading', afterText, '#### ');
        cursorOffset = start + 5 + (selectedText ? selectedText.length : 7);
        break;

      case 'ul':
        newText = insertAtLineStart(beforeText, selectedText || 'List item', afterText, '- ');
        cursorOffset = start + 2 + (selectedText ? selectedText.length : 9);
        break;

      case 'ol':
        newText = insertAtLineStart(beforeText, selectedText || 'List item', afterText, '1. ');
        cursorOffset = start + 3 + (selectedText ? selectedText.length : 9);
        break;

      case 'quote':
        newText = insertAtLineStart(beforeText, selectedText || 'Quote', afterText, '> ');
        cursorOffset = start + 2 + (selectedText ? selectedText.length : 5);
        break;

      default:
        return;
    }

    onChange(newText);

    // Restore focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      if (type === 'bold' || type === 'italic' || type === 'strikethrough') {
        if (!selectedText) {
          // Select the placeholder text
          const prefixLen = type === 'bold' || type === 'strikethrough' ? 2 : 1;
          textarea.setSelectionRange(start + prefixLen, start + prefixLen + 4);
        } else {
          textarea.setSelectionRange(cursorOffset, cursorOffset);
        }
      } else {
        textarea.setSelectionRange(cursorOffset, cursorOffset);
      }
    }, 0);
  };

  // Helper to insert prefix at the start of the current line
  const insertAtLineStart = (before: string, text: string, after: string, prefix: string): string => {
    // Find the start of the current line
    const lastNewline = before.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const beforeLine = before.substring(0, lineStart);
    const currentLinePrefix = before.substring(lineStart);

    // Check if we need a newline before
    const needsNewlineBefore = beforeLine.length > 0 && !beforeLine.endsWith('\n') && lineStart === before.length;

    if (needsNewlineBefore) {
      return `${before}\n${prefix}${text}${after}`;
    }

    return `${beforeLine}${prefix}${currentLinePrefix}${text}${after}`;
  };

  return (
    <div className="space-y-2">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-charcoal/5 rounded-soft">
        {formatButtons.map((btn) => (
          <button
            key={btn.type}
            type="button"
            onClick={() => applyFormat(btn.type)}
            className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors
              ${btn.type === 'bold' ? 'font-bold' : ''}
              ${btn.type === 'italic' ? 'italic' : ''}
              ${btn.type === 'strikethrough' ? 'line-through' : ''}
              hover:bg-terracotta/20 active:bg-terracotta/30 text-charcoal`}
            title={btn.title}
            aria-label={btn.title}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta resize-y font-mono text-sm"
      />

      {/* Help Text */}
      <p className="text-xs text-charcoal/50">
        Tip: Select text and click a button to format, or click a button to insert placeholder text.
      </p>
    </div>
  );
}
