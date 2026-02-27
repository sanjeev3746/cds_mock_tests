import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * MathText — renders plain text, inline/block LaTeX math, and markdown tables.
 *
 * Syntax:
 *   Inline math  : $x^2 + \frac{1}{x} = 5$
 *   Block math   : $$x^3 + \frac{1}{x^3} = \frac{65}{8}$$
 *   Table        : (pipe-separated, see example below)
 *
 *   | Name  | Age |
 *   |-------|-----|
 *   | Alice | 20  |
 */

function renderKatex(math, displayMode) {
  try {
    return katex.renderToString(math, { throwOnError: false, displayMode, output: 'html' });
  } catch (e) {
    return math;
  }
}

/** Parse a markdown table block into an HTML <table> string */
function parseTable(block) {
  const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  const parseRow = (line) =>
    line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());

  const headers = parseRow(lines[0]);
  // lines[1] is the separator row (---|---|---)
  const rows = lines.slice(2).map(parseRow);

  const headerHtml = headers.map(h => `<th>${h}</th>`).join('');
  const rowsHtml = rows
    .map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`)
    .join('');

  return `<table class="math-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
}

/** Split text into: table blocks, math tokens, plain text */
function tokenize(text) {
  const tokens = [];
  // Detect markdown table blocks (lines starting with |)
  const tableRegex = /^(\|.+\n)+(\|[-| :]+\n)((\|.+\n?)*)/gm;
  let last = 0;
  let match;

  tableRegex.lastIndex = 0;
  while ((match = tableRegex.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ type: 'text', content: text.slice(last, match.index) });
    }
    tokens.push({ type: 'table', content: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    tokens.push({ type: 'text', content: text.slice(last) });
  }

  // Within text segments, split by $$...$$ and $...$
  const result = [];
  tokens.forEach((token, ti) => {
    if (token.type !== 'text') { result.push(token); return; }
    const parts = token.content.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
    parts.forEach((part, pi) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        result.push({ type: 'block-math', content: part.slice(2, -2) });
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        result.push({ type: 'inline-math', content: part.slice(1, -1) });
      } else {
        result.push({ type: 'plain', content: part });
      }
    });
  });

  return result;
}

function MathText({ text }) {
  if (!text) return null;

  const tokens = tokenize(text);

  return (
    <span className="math-text">
      {tokens.map((token, i) => {
        switch (token.type) {
          case 'table': {
            const html = parseTable(token.content);
            if (!html) return <span key={i}>{token.content}</span>;
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          }
          case 'block-math':
            return (
              <span
                key={i}
                style={{ display: 'block', overflowX: 'auto', textAlign: 'center', margin: '0.4rem 0' }}
                dangerouslySetInnerHTML={{ __html: renderKatex(token.content, true) }}
              />
            );
          case 'inline-math':
            return (
              <span
                key={i}
                dangerouslySetInnerHTML={{ __html: renderKatex(token.content, false) }}
              />
            );
          default:
            return <span key={i}>{token.content}</span>;
        }
      })}
    </span>
  );
}

export default MathText;

