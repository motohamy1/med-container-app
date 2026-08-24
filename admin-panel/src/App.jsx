import { useState } from 'react';
import './index.css';

const TRUSTED_SOURCES_PRESETS = [
  {
    society: 'GOLD',
    name: 'GOLD 2024 (COPD Guidelines)',
    url: 'https://goldcopd.org/2024-gold-report-2/',
    year: 2024,
    versionTag: 'GOLD 2024 Global Strategy',
  },
  {
    society: 'AHA/ACC',
    name: 'AHA/ACC Guideline Hub',
    url: 'https://www.ahajournals.org/guidelines',
    year: 2024,
    versionTag: 'AHA/ACC Clinical Guidelines',
  },
  {
    society: 'ESC',
    name: 'ESC Cardiovascular Guidelines',
    url: 'https://www.escardio.org/Guidelines',
    year: 2024,
    versionTag: 'ESC Clinical Practice Guidelines',
  },
  {
    society: 'IDSA',
    name: 'IDSA Practice Guidelines',
    url: 'https://www.idsociety.org/practice-guideline/practice-guidelines',
    year: 2024,
    versionTag: 'IDSA Antimicrobial & Infectious Guidelines',
  },
  {
    society: 'KDIGO',
    name: 'KDIGO Clinical Practice Guidelines',
    url: 'https://kdigo.org/guidelines/',
    year: 2024,
    versionTag: 'KDIGO Nephrology Consensus',
  },
  {
    society: 'SURVIVING SEPSIS',
    name: 'Surviving Sepsis Campaign (SCCM/ESICM)',
    url: 'https://www.sccm.org/SurvivingSepsisCampaign/Home',
    year: 2024,
    versionTag: 'Sepsis-3 Resuscitation Guidelines',
  },
  {
    society: 'NICE',
    name: 'NICE UK Clinical Guidelines',
    url: 'https://www.nice.org.uk/guidance',
    year: 2024,
    versionTag: 'NICE Evidence-Based Guidance',
  },
  {
    society: 'ADA',
    name: 'ADA Standards of Care in Diabetes',
    url: 'https://diabetesjournals.org/care/issue/47/Supplement_1',
    year: 2024,
    versionTag: 'ADA Standards of Care 2024',
  },
  {
    society: 'ESPGHAN/NASPGHAN',
    name: 'ESPGHAN/NASPGHAN Pediatric Guidelines',
    url: 'https://www.naspghan.org/guidelines',
    year: 2024,
    versionTag: 'ESPGHAN/NASPGHAN Pediatric Consensus',
  },
  {
    society: 'ACG/AGA',
    name: 'ACG Clinical Guidelines (Gastroenterology)',
    url: 'https://gi.org/clinical-guidelines/',
    year: 2024,
    versionTag: 'ACG Clinical Guidelines',
  },
];

function App() {
  const [title, setTitle] = useState('');
  const [guidelineSociety, setGuidelineSociety] = useState('GOLD');
  const [publicationYear, setPublicationYear] = useState(new Date().getFullYear());
  const [versionTag, setVersionTag] = useState('');
  const [pmid, setPmid] = useState('');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0); // percentage 0-100
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  const handleApplyPreset = (preset) => {
    setTitle(preset.name);
    setGuidelineSociety(preset.society);
    setUrl(preset.url);
    setPublicationYear(preset.year);
    setVersionTag(preset.versionTag);
    setFile(null);
    setRawText('');
  };

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
        formData.append('guidelineSociety', guidelineSociety);
        formData.append('publicationYear', publicationYear.toString());
        formData.append('versionTag', versionTag || `${guidelineSociety} ${publicationYear}`);
        formData.append('pmid', pmid);
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
                setStatusText('Knowledge & Verified Guideline Ingested Successfully!');
                setProgress(100);
                eventSource.close();
                setTimeout(() => {
                    setIsProcessing(false);
                    setFile(null);
                    setRawText('');
                    setUrl('');
                    setTitle('');
                    setVersionTag('');
                    setPmid('');
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
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 border-b border-brand-border pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-text mb-1 flex items-center gap-2">
              <span className="text-brand-accent">✦</span> Medical Arena
            </h1>
            <p className="text-brand-muted text-xs tracking-widest font-mono uppercase">EVIDENCE-BASED GUIDELINES INGESTION ENGINE</p>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg text-emerald-400 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Verified Sources Only (Active Filtering)
          </div>
        </header>

        {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-5 py-4 rounded-xl mb-8 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
            </div>
        )}

        {/* Quick Presets for Big Reliable Medical Sources */}
        <div className="mb-8 p-6 bg-brand-surface/80 rounded-2xl border border-brand-border shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-brand-text tracking-wide uppercase">Top Authoritative Medical Society Presets</h2>
            <span className="text-xs text-brand-muted font-mono">1-Click Auto-Fill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {TRUSTED_SOURCES_PRESETS.map((preset) => (
              <button
                key={preset.society}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                disabled={isProcessing}
                className="p-3 text-left rounded-xl bg-brand-bg/60 border border-brand-border/80 hover:border-brand-accent hover:bg-brand-bg transition-all group disabled:opacity-50"
              >
                <div className="text-xs font-bold text-brand-accent group-hover:underline">{preset.society}</div>
                <div className="text-[11px] text-brand-muted line-clamp-1 mt-0.5">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-brand-surface p-8 rounded-2xl border border-brand-border shadow-xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-text">Resource Title *</label>
              <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. GOLD 2024 Global Strategy for COPD" 
                  className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors" 
                  disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-text">Guideline Society / Authority *</label>
              <select
                value={guidelineSociety}
                onChange={e => setGuidelineSociety(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors"
              >
                <option value="GOLD">GOLD (Pulmonology / COPD)</option>
                <option value="AHA/ACC">AHA / ACC (Cardiology)</option>
                <option value="ESC">ESC (European Cardiology)</option>
                <option value="IDSA">IDSA (Infectious Diseases)</option>
                <option value="KDIGO">KDIGO (Nephrology)</option>
                <option value="SURVIVING SEPSIS">Surviving Sepsis Campaign (ICU/Critical)</option>
                <option value="NICE">NICE (National Institute for Health and Care)</option>
                <option value="ADA">ADA (Diabetes & Endocrinology)</option>
                <option value="EASL">EASL (Hepatology / GIT)</option>
                <option value="WHO">WHO Clinical Guidelines</option>
                <option value="OTHER">Other Peer-Reviewed Journal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-text">Publication Year</label>
              <input 
                  type="number" 
                  value={publicationYear}
                  onChange={e => setPublicationYear(parseInt(e.target.value) || 2024)}
                  min="2000"
                  max="2030"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent transition-colors" 
                  disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-text">Version / Edition Tag</label>
              <input 
                  type="text" 
                  value={versionTag}
                  onChange={e => setVersionTag(e.target.value)}
                  placeholder="e.g. 2024 Annual Update" 
                  className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-accent transition-colors" 
                  disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-text">PubMed ID / DOI (Optional)</label>
              <input 
                  type="text" 
                  value={pmid}
                  onChange={e => setPmid(e.target.value)}
                  placeholder="e.g. PMID: 38237890" 
                  className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-accent transition-colors" 
                  disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-brand-border">
            <div>
              <h2 className="text-base font-medium text-brand-text mb-1">Upload / Target Source</h2>
              <p className="text-sm text-brand-muted mb-4">Select the ingestion method for this authoritative medical resource.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
                
                {/* File Upload */}
                <div className={`p-5 border rounded-xl transition-colors duration-200 ${activeMethod === 'file' ? 'border-brand-accent bg-brand-bg' : 'border-brand-border bg-brand-bg/50'}`}>
                    <label className="block text-sm font-medium mb-3">1. Upload Official Guideline PDF or Text File</label>
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
                    <label className="block text-sm font-medium mb-3">2. Ingest via Authoritative Web URL / Guideline Portal</label>
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
                    <label className="block text-sm font-medium mb-3">3. Paste Official Guideline Text or Diagnostic Protocol</label>
                    <textarea 
                        rows="4"
                        value={rawText}
                        onChange={e => {
                            setRawText(e.target.value);
                            setFile(null);
                            setUrl('');
                        }}
                        className="w-full bg-brand-surface border border-brand-border rounded-lg p-3 text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                        placeholder="Paste extensive clinical guideline text or recommendations here..."
                        disabled={isProcessing || activeMethod === 'file' || activeMethod === 'url'}
                    ></textarea>
                </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-brand-border">
            
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
                    <div className="text-xs text-brand-muted font-mono">
                        Embeddings will be indexed with 3072-dimension vectors & active guideline tags.
                    </div>
                )}
            </div>
            
            <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold py-2.5 px-6 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent"
            >
                {isProcessing ? 'Ingesting Guideline...' : 'Ingest & Index Guideline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
