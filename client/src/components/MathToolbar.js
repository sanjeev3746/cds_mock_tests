import React from 'react';

/**
 * Reusable math/table toolbar.
 *
 * CONTEXT-AWARE: detects whether the cursor is already inside $...$ math.
 *   - Outside math → buttons insert with $...$ wrappers
 *   - Inside  math → buttons insert raw LaTeX only (no extra $)
 *
 * NESTING: select any expression (with or without $), click a button to wrap.
 *   Supports: √ inside √, frac inside √, √ inside frac, frac inside frac, etc.
 */
const MathToolbar = ({ textRef, value, onChange, showTable = false }) => {

  /** True if cursor position `pos` is inside an inline $...$ block */
  const isInsideMath = (pos) => {
    let count = 0;
    for (let i = 0; i < pos; i++) {
      if (value[i] === '$') {
        // skip $$ (block math delimiter)
        if (i + 1 < value.length && value[i + 1] === '$') { i++; }
        else count++;
      }
    }
    return count % 2 === 1;
  };

  /**
   * Context-aware insert / wrap.
   *
   * @param {string}   template      Raw LaTeX template (no $), e.g. `\sqrt{}`
   * @param {number}   tplFromEnd    Cursor chars from end of template, e.g. 1 → before last `}`
   * @param {function} wrapFn        inner => wrapped raw LaTeX, e.g. inner => `\sqrt{${inner}}`
   * @param {number}   wrapFromEnd   Cursor chars from end of wrapped LaTeX (0 = at end)
   */
  const applyMath = (template, tplFromEnd, wrapFn, wrapFromEnd) => {
    const el = textRef && textRef.current;
    if (!el) { onChange(value + `$${template}$`); return; }

    const start  = el.selectionStart;
    const end    = el.selectionEnd;
    const sel    = value.slice(start, end).trim();
    const inside = isInsideMath(start);

    let insert, cursor;

    if (sel.length > 0) {
      // Strip outer $...$ from selection to get raw inner LaTeX
      let inner = sel;
      const hadDollar = inner.startsWith('$') && inner.endsWith('$') && inner.length > 2;
      if (hadDollar) inner = inner.slice(1, -1);

      const latex = wrapFn(inner);
      // Stay raw if cursor is inside math and selection had no $
      if (inside && !hadDollar) {
        insert = latex;
      } else {
        insert = `$${latex}$`;
      }
      cursor = start + insert.length
             - wrapFromEnd
             - (insert.endsWith('$') ? 1 : 0); // account for trailing $
    } else {
      if (inside) {
        // Inside existing $...$ — insert raw LaTeX, no dollar wrappers
        insert = template;
        cursor = start + insert.length - tplFromEnd;
      } else {
        // Outside math — wrap with $
        insert = `$${template}$`;
        cursor = start + insert.length - tplFromEnd - 1; // -1 for trailing $
      }
    }

    onChange(value.slice(0, start) + insert + value.slice(end));
    setTimeout(() => { el.selectionStart = el.selectionEnd = cursor; el.focus(); }, 0);
  };

  const insertTable = () => {
    const el = textRef && textRef.current;
    const tpl = `\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
    if (el) {
      const s = el.selectionStart, e = el.selectionEnd;
      onChange(value.slice(0, s) + tpl + value.slice(e));
      setTimeout(() => { el.selectionStart = el.selectionEnd = s + tpl.length; el.focus(); }, 0);
    } else { onChange(value + tpl); }
  };

  const insertLineGap = () => {
    const el = textRef && textRef.current;
    if (el) {
      const s = el.selectionStart, e = el.selectionEnd;
      onChange(value.slice(0, s) + '\n\n' + value.slice(e));
      setTimeout(() => { el.selectionStart = el.selectionEnd = s + 2; el.focus(); }, 0);
    } else { onChange(value + '\n\n'); }
  };

  return (
    <div className="question-toolbar">
      {showTable && (
        <button type="button" className="toolbar-btn" title="Insert Markdown Table"
          onClick={insertTable}>
          📊 Table
        </button>
      )}

      {/* Power — tplFromEnd=1 (cursor inside {}), wrapFromEnd=1 (cursor in exponent) */}
      <button type="button" className="toolbar-btn"
        title="Power: click for template, or SELECT base then click. Works inside existing math."
        onClick={() => applyMath('x^{}', 1, inner => `{${inner}}^{}`, 1)}>
        x<sup>n</sup> Power
      </button>

      {/* Sqrt — tplFromEnd=1 (cursor inside {}), wrapFromEnd=0 (cursor after expression) */}
      <button type="button" className="toolbar-btn"
        title="Square Root: click for template, or SELECT expression then click to wrap. Works inside existing math."
        onClick={() => applyMath('\\sqrt{}', 1, inner => `\\sqrt{${inner}}`, 0)}>
        √ Sqrt
      </button>

      {/* Frac — tplFromEnd=3 (cursor in numerator {}), wrapFromEnd=1 (cursor in denominator {}) */}
      <button type="button" className="toolbar-btn"
        title="Fraction: click for template, or SELECT numerator then click (cursor lands in denominator). Works inside existing math."
        onClick={() => applyMath('\\frac{}{}', 3, inner => `\\frac{${inner}}{}`, 1)}>
        ½ Frac
      </button>

      <button type="button" className="toolbar-btn"
        title="Insert blank line for spacing between sentences"
        onClick={insertLineGap}>
        ↵ Line Gap
      </button>

      <span className="toolbar-hint">
        <strong>Tip:</strong> click inside <code>$...$</code> then use buttons — no extra <code>$</code> added!
        &nbsp;Select text → click button to wrap (nesting works).
      </span>
    </div>
  );
};

export default MathToolbar;
