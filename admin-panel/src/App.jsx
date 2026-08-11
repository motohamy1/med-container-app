import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0); // percentage 0-100
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
        setError('Resource title is required.');
        return;
    }
    if (!file && !url && !rawText) {
        setError('Please provide a source to ingest: a file, URL, or raw text.');
        return;
    }

    setError('');
    setIsProcessing(true);
    setProgress(0);
    setStatusText('Initiating ingestion...');

    const jobId = 'job_' + Date.now();

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('jobId', jobId);
        if (url) formData.append('url', url);
        if (rawText) formData.append('rawText', rawText);
        if (file) formData.append('file', file);

        const eventSource = new EventSource(`http://localhost:3001/api/admin/progress/${jobId}`);
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.total > 0) {
                const pct = Math.round((data.processed / data.total) * 100);
                setProgress(pct);
                setStatusText(`Embedding chunk ${data.processed} of ${data.total}`);
            }
            if (data.status === 'complete') {
                setStatusText('Knowledge ingested successfully.');
                setProgress(100);
                eventSource.close();
                setTimeout(() => {
                    setIsProcessing(false);
                    setFile(null);
                    setRawText('');
                    setUrl('');
                    setTitle('');
                    setProgress(0);
                    setStatusText('');
                }, 3000);
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        const res = await fetch('http://localhost:3001/api/admin/ingest', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Ingestion request failed');
        }

    } catch (err) {
        setError(err.message);
        setIsProcessing(false);
    }
  };

  const activeMethod = file ? 'file' : url ? 'url' : rawText ? 'text' : null;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-6 md:p-12 font-sans selection:bg-brand-accent selection:text-brand-bg">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-brand-border pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-text mb-2">Medical Arena</h1>
          <p className="text-brand-muted text-sm tracking-wide">KNOWLEDGE INGESTION ENGINE</p>
        </header>

        {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-5 py-4 rounded-xl mb-8 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-brand-surface p-8 rounded-2xl border border-brand-border shadow-xl">
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-brand-text">Resource Title</label>
            <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. AHA 2024 Guidelines" 
                className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors duration-200" 
                disabled={isProcessing}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-brand-border">
            <div>
              <h2 className="text-base font-medium text-brand-text mb-1">Upload Source</h2>
              <p className="text-sm text-brand-muted mb-4">Select exactly one ingestion method.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
                
                {/* File Upload */}
                <div className={`p-5 border rounded-xl transition-colors duration-200 ${activeMethod === 'file' ? 'border-brand-accent bg-brand-bg' : 'border-brand-border bg-brand-bg/50'}`}>
                    <label className="block text-sm font-medium mb-3">1. Document Upload</label>
                    <input 
                        type="file" 
                        accept=".pdf,.txt"
                        onChange={e => {
                            setFile(e.target.files[0]);
                            setUrl('');
                            setRawText('');
                        }}
                        disabled={isProcessing || activeMethod === 'url' || activeMethod === 'text'}
                        className="block w-full text-sm text-brand-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-surface file:text-brand-text file:border file:border-brand-border hover:file:bg-brand-border hover:file:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* URL */}
                <div className={`p-5 border rounded-xl transition-colors duration-200 ${activeMethod === 'url' ? 'border-brand-accent bg-brand-bg' : 'border-brand-border bg-brand-bg/50'}`}>
                    <label className="block text-sm font-medium mb-3">2. Remote URL</label>
                    <input 
                        type="url" 
                        value={url}
                        onChange={e => {
                            setUrl(e.target.value);
                            setFile(null);
                            setRawText('');
                        }}
                        placeholder="https://..."
                        className="w-full bg-brand-surface border border-brand-border rounded-lg p-3 text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isProcessing || activeMethod === 'file' || activeMethod === 'text'}
                    />
                </div>

                {/* Raw Text */}
                <div className={`p-5 border rounded-xl transition-colors duration-200 ${activeMethod === 'text' ? 'border-brand-accent bg-brand-bg' : 'border-brand-border bg-brand-bg/50'}`}>
                    <label className="block text-sm font-medium mb-3">3. Raw Text</label>
                    <textarea 
                        rows="4"
                        value={rawText}
                        onChange={e => {
                            setRawText(e.target.value);
                            setFile(null);
                            setUrl('');
                        }}
                        className="w-full bg-brand-surface border border-brand-border rounded-lg p-3 text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                        placeholder="Paste extensive clinical text here..."
                        disabled={isProcessing || activeMethod === 'file' || activeMethod === 'url'}
                    ></textarea>
                </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            
            <div className="w-full flex-1">
                {isProcessing ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-brand-muted font-medium uppercase tracking-wider">
                            <span>{statusText}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-brand-bg border border-brand-border rounded-full h-1.5 overflow-hidden">
                            <div className="bg-brand-accent h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-brand-muted">
                        Ready to process.
                    </div>
                )}
            </div>
            
            <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-medium py-2.5 px-6 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent"
            >
                {isProcessing ? 'Processing...' : 'Ingest Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
