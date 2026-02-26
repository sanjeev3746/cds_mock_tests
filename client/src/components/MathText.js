import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * MathText - Renders text with embedded LaTeX math equations.
 *
 * Supports:
 *   Block math:  $$x^3 + \frac{1}{x^3} = \frac{65}{8}$$
 *   Inline math: The value of $x^2$ is 4.
 *
 * Usage in question/option text:
 *   <MathText text="If $x^3 + \frac{1}{x^3} = \frac{65}{8}$, find $xy$" />
 */
function MathText({ text }) {
  if (!text) return null;

  // Split by block math ($$...$$) first
  const blockSegments = text.split(/((?:\$\$)[\s\S]+?(?:\$\$))/);

  const rendered = blockSegments.map((segment, blockIdx) => {
    if (segment.startsWith('$$') && segment.endsWith('$$')) {
      const math = segment.slice(2, -2);
      return (
        <span key={`block-${blockIdx}`} className="math-block">
          <BlockMath math={math} errorColor="#cc0000" />
        </span>
      );
    }

    // Split remaining text by inline math ($...$)
    const inlineSegments = segment.split(/(\$(?:[^$\\]|\\.)+?\$)/);
    return inlineSegments.map((inlineSeg, inlineIdx) => {
      if (inlineSeg.startsWith('$') && inlineSeg.endsWith('$') && inlineSeg.length > 2) {
        const math = inlineSeg.slice(1, -1);
        return (
          <InlineMath key={`inline-${blockIdx}-${inlineIdx}`} math={math} errorColor="#cc0000" />
        );
      }
      return <span key={`text-${blockIdx}-${inlineIdx}`}>{inlineSeg}</span>;
    });
  });

  return <span className="math-text">{rendered}</span>;
}

export default MathText;
