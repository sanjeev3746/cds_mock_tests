import React from 'react';

/**
 * Reusable math/table toolbar for question form textareas and inputs.
 *
 * Props:
 *   textRef   - React ref pointing to the textarea/input element
 *   value     - current string value of the field
 *   onChange  - callback(newValue: string)
 *   showTable - if true, shows the "📊 Table" button (default false)
 */
const MathToolbar = ({ textRef, value, onChange, showTable = false }) => {
  const insert = (template, cursorOffset) => {
    const el = textRef && textRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newText = value.slice(0, start) + template + value.slice(end);
      onChange(newText);
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + cursorOffset;
        el.focus();
      }, 0);
    } else {
      onChange(value + template);
    }
  };

  const tableTemplate = `\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;

  return (
    <div className="question-toolbar">
      {showTable && (
        <button
          type="button"
          className="toolbar-btn"
          title="Insert Markdown Table"
          onClick={() => insert(tableTemplate, tableTemplate.length)}
        >
          📊 Table
        </button>
      )}
      <button
        type="button"
        className="toolbar-btn"
        title="Power / Superscript — supports multi-digit, e.g. x^{12}"
        onClick={() => insert('$x^{}$', 4)}
      >
        x<sup>n</sup> Power
      </button>
      <button
        type="button"
        className="toolbar-btn"
        title="Square Root — wrap whole expression, e.g. √(a²+b²)"
        onClick={() => insert('$\\sqrt{}$', 7)}
      >
        √ Sqrt
      </button>
      <button
        type="button"
        className="toolbar-btn"
        title="Fraction — first {} is numerator (top), second {} is denominator (bottom)"
        onClick={() => insert('$\\frac{}{}$', 7)}
      >
        ½ Frac
      </button>
      <span className="toolbar-hint">
        <code>$x^&#123;12&#125;$</code> ·{' '}
        <code>$\sqrt&#123;a^2+b^2&#125;$</code> ·{' '}
        <code>$\frac&#123;2a&#125;&#123;3&#125;$</code>
      </span>
    </div>
  );
};

export default MathToolbar;
