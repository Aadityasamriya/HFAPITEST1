import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const onCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group my-6 rounded-xl overflow-hidden bg-[#0d0d0d] border border-neutral-800 shadow-xl">
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] text-neutral-400 text-xs font-mono border-b border-neutral-800">
          <span>{match[1]}</span>
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, background: 'transparent', padding: '1rem', fontSize: '0.875rem' }}
          className="text-sm custom-scrollbar"
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono border border-neutral-200" {...props}>
      {children}
    </code>
  );
};
