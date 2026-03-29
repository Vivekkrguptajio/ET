import { useState, useEffect, useRef } from 'react';
import './AIResponseBox.css';

export default function AIResponseBox({ response, loading = false }) {
  const [displayedText, setDisplayedText] = useState('');
  const containerRef = useRef(null);

  // Simulate streaming effect
  useEffect(() => {
    if (!response) {
      setDisplayedText('');
      return;
    }
    let i = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (i < response.length) {
        setDisplayedText(response.slice(0, i + 1));
        i++;
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
      }
    }, 8);
    return () => clearInterval(interval);
  }, [response]);

  if (!response && !loading) return null;

  return (
    <div className="ai-response-box card animate-fadeInUp" id="ai-response-box">
      <div className="ai-header">
        <div className="ai-avatar">
          <span>🤖</span>
        </div>
        <div className="ai-info">
          <span className="ai-name">ET AI Advisor</span>
          <span className="ai-badge">AI-Powered Insights</span>
        </div>
      </div>
      <div className="ai-body" ref={containerRef}>
        {loading ? (
          <div className="ai-loading">
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="ai-loading-text">Analyzing your data...</span>
          </div>
        ) : (
          <div className="ai-content">
            {formatResponse(displayedText)}
          </div>
        )}
      </div>
    </div>
  );
}

function formatResponse(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) {
      return <h4 key={i} className="ai-h4">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} className="ai-h3">{line.slice(3)}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} className="ai-h2">{line.slice(2)}</h2>;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return <li key={i} className="ai-list-item">{formatInline(line.slice(2))}</li>;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="ai-bold">{line.slice(2, -2)}</p>;
    }
    if (line.trim() === '') {
      return <br key={i} />;
    }
    return <p key={i} className="ai-para">{formatInline(line)}</p>;
  });
}

function formatInline(text) {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Highlight numbers with ₹
    const numParts = part.split(/(₹[\d,]+(?:\.\d+)?)/g);
    return numParts.map((np, j) => {
      if (np.match(/^₹/)) {
        return <span key={`${i}-${j}`} className="ai-currency">{np}</span>;
      }
      return np;
    });
  });
}
