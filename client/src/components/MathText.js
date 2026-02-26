import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * MathText - Renders text with embedded LaTeX math equations.
 *
 * Use $$...$$ for block (centered) math and $...$ for inline math.
 * Plain text is rendered as-is.
 *
 * Example: "If $x^3 + \frac{1}{x^3} = \frac{65}{8}$, find $xy$"
 */
function MathText({ text }) {
  if (!text) return null;

  // Split by $$...$$ and $...$ while keeping delimiters
  const tokens = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);

  return (
    <span className="math-text">
      {tokens.map((token, i) => {
        if (token.startsWith('$$') && token.endsWith('$$')) {
          // Block math
          const math = token.slice(2, -2);
          let html = '';
          try {
            html = katex.renderToString(math, { displayMode: true, throwOnError: false, output: 'html' });
          } catch (e) {
            return <span key={i} style={{ color: 'red' }}>{token}</span>;
          }
          return <span key={i} style={{ display: 'block', overflowX: 'auto', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: html }} />;
        }

        if (token.startsWith('$') && token.endsWith('$') && token.length > 2) {
          // Inline math
          const math = token.slice(1, -1);
          let html = '';
          try {
            html = katex.renderToString(math, { displayMode: false, throwOnError: false, output: 'html' });
          } catch (e) {
            return <span key={i} style={{ color: 'red' }}>{token}</span>;
          }
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        }

        // Plain text
        return <span key={i}>{token}</span>;
      })}
    </span>
  );
}

export default MathText;
