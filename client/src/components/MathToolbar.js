import React from 'react';

/**
 * Reusable math/table toolbar.
 *
 * Nesting workflow: type an expression (e.g. $\frac{a}{b}$), SELECT it,
 * then click a button to wrap it — enabling unlimited nesting:
 *   √ inside √, frac inside √, √ inside frac, frac inside frac, etc.
 *
 * Props:
 *   textRef   - React ref pointing to the textarea/input element
 *   value     - current string value of the field
 *   onChange  - callback(newValue: string)
 *   showTable - if true, shows the "📊 Table" button (default false)
 */
const MathToolbar = ({ textRef, value, onChange, showTable = false }) => {
  /**
   * insertOrWrap — if text is selected, strip outer $…$ and wrap the inner
   * LaTeX with wrapFn; otherwise insert the plain template.
   *
   * @param {string}   template          - inserted when nothing is selected
   * @param {number}   noSelCursorOffset - cursor position when nothing selected
   * @param {function} wrapFn            - inner => wrappedLatex (no $ delimiters)
   * @param {number}   wrapCursorFromEnd - chars from end of result to place cursor
   *                                       (0 = at end, 2 = before last `}$`, etc.)
   */
  const insertOrWrap = (template, noSelCursorOffset, wrapFn, wrapCursorFromEnd) => {
    const el = textRef && textRef.current;
    if (!el) { onChange(value + template); return; }

    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const selected = value.slice(start, end);

    let newText, newCursor;

    if (selected.length > 0) {
      // Strip surrounding $…$ if selection is a complete math expression
      let inner = selected.trim();
      if (inner.startsWith('$') && inner.endsWith('$') && inner.length > 2) {
        inner = inner.slice(1, -1);
      }
      const wrapped = `$${wrapFn(inner)}$`;
      newText   = value.slice(0, start) + wrapped + value.slice(end);
      newCursor = start + wrapped.length - wrapCursorFromEnd;
    } else {
      newText   = value.slice(0, start) + template + value.slice(end);
      newCursor = start + noSelCursorOffset;
    }

    onChange(newText);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = newCursor;
      el.focus();
    }, 0);
  };

  const insertTable = () => {
    const el = textRef && textRef.current;
    const tpl = `\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
    if (el) {
      const s = el.selectionStart, e = el.selectionEnd;
      onChange(value.slice(0, s) + tpl + value.slice(e));
      setTimeout(() => { el.selectionStart = el.selectionEnd = s + tpl.length; el.focus(); }, 0);
    } else {
      onChange(value + tpl);
    }
  };

  return (
    <div className="question-toolbar">
      {showTable && (
        <button type="button" className="toolbar-btn" title="Insert Markdown Table"
          onClick={insertTable}>
          📊 Table
        </button>
      )}

      {/* Power: no selection → $x^{}$; selection → ${selection}^{}$ cursor in exponent */}
      <button type="button" className="toolbar-btn"
        title="Power — click to insert template, or SELECT base then click to set it as base"
        onClick={() => insertOrWrap('$x^{}$', 4, inner => `{${inner}}^{}`, 2)}>
        x<sup>n</sup> Power
      </button>

      {/* Sqrt: no selection → $\sqrt{}$; selection → $\sqrt{selection}$ */}
      <button type="button" className="toolbar-btn"
        title="Square Root — click to insert template, or SELECT expression then click to wrap it under √"
        onClick={() => insertOrWrap('$\\sqrt{}$', 7, inner => `\\sqrt{${inner}}`, 0)}>
        √ Sqrt
      </button>

      {/* Frac: no selection → $\frac{}{}$; selection → $\frac{selection}{}$ cursor in denominator */}
      <button type="button" className="toolbar-btn"
        title="Fraction — click to insert template, or SELECT numerator then click (cursor lands in denominator)"
        onClick={() => insertOrWrap('$\\frac{}{}$', 7, inner => `\\frac{${inner}}{}`, 2)}>
        ½ Frac
      </button>

      {/* Line break: inserts a blank line for spacing */}
      <button type="button" className="toolbar-btn"
        title="Insert a blank line for paragraph/line spacing"
        onClick={() => {
          const el = textRef && textRef.current;
          if (el) {
            const s = el.selectionStart, e = el.selectionEnd;
            const nl = '\n\n';
            onChange(value.slice(0, s) + nl + value.slice(e));
            setTimeout(() => { el.selectionStart = el.selectionEnd = s + nl.length; el.focus(); }, 0);
          } else { onChange(value + '\n\n'); }
        }}>
        ↵ Line Gap
      </button>

      <span className="toolbar-hint">
        <strong>Nesting tip:</strong> select an expression then click a button to wrap it
        &nbsp;·&nbsp; <code>$x^&#123;12&#125;$</code>
        &nbsp;·&nbsp; <code>$\sqrt&#123;\frac&#123;a&#125;&#123;b&#125;&#125;$</code>
      </span>
    </div>
  );
};

export default MathToolbar;
