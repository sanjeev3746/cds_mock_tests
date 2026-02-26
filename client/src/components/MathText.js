import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * MathText - Renders text with embedded LaTeX math equations.
 *
 * Supports:
 *   Block math:  $$x^3 + \frac{1}{x^3} = \frac{65}{8}$$
 *   Inline math: The value of $x^2$ is 4.
 *
 * Usage:
 *   <MathText text="If $x^3 + \frac{1}{x^3} = \frac{65}{8}$, find $xy$" />
 */

function renderMath(mathStr, displayMode) {
  try {
    return katex.renderToString(mathStr, {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch (e) {
    return mathStr;
  }
}

function MathText({ text }) {
  if (!text) return null;

  // Split by $$...$$ (block) first, then $...$ (inline)
  const parts = [];
  const blockRegex = /\$\$([\s\S]+?)\$\$/g;
  const inlineRegex = /\$([^$\n]+?)\$/g;

  let lastIndex = 0;
  let match;

  // Process block math first
  const blockSplit = [];
  lastIndex = 0;
  blockRegex.lastIndex = 0;
  while ((match = blockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blockSplit.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    blockSplit.push({ type: 'block', content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    blockSplit.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // Then process inline math within text segments
  blockSplit.forEach((part, i) => {
    if (part.type === 'block') {
      parts.push(
        <span
          key={`block-${i}`}
          dangerouslySetInnerHTML={{ __html: renderMath(part.content, true) }}
        />
      );
    } else {
      // Split by inline $...$
      const inlineParts = [];
      let textLeft = part.content;
      let inlineLastIndex = 0;
      inlineRegex.lastIndex = 0;
      while ((match = inlineRegex.exec(textLeft)) !== null) {
        if (match.index > inlineLastIndex) {
          inlineParts.push(
            <span key={`t-${i}-${inlineLastIndex}`}>{textLeft.slice(inlineLastIndex, match.index)}</span>
          );
        }
        inlineParts.push(
          <span
            key={`inline-${i}-${match.index}`}
            dangerouslySetInnerHTML={{ __html: renderMath(match[1], false) }}
          />
        );
        inlineLastIndex = match.index + match[0].length;
      }
      if (inlineLastIndex < textLeft.length) {
        inlineParts.push(<span key={`t-${i}-end`}>{textLeft.slice(inlineLastIndex)}</span>);
      }
      parts.push(<span key={`seg-${i}`}>{inlineParts}</span>);
    }
  });

  return <span className="math-text">{parts}</span>;
}

export default MathText;
