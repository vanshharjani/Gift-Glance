import React, { useState, useRef, useEffect } from 'react';
import { analyzeGiftProfile } from './services/geminiService';
import { AnalysisResult, InputMode, QuizAnswers, Relationship } from './types';

const App: React.FC = () => {
  // Data State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<InputMode>('photo');
  const [relationship, setRelationship] = useState<Relationship>('Partner');
  const [budget, setBudget] = useState<number>(100);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizAnswers>({ activity: '', complaint: '', vibe: '' });
  const [notes, setNotes] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Dropdown State
  const [isRelationshipDropdownOpen, setIsRelationshipDropdownOpen] = useState(false);
  const relationshipDropdownRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const relationshipOptions: Relationship[] = ['Partner', 'Friend', 'Parent', 'Sibling', 'Colleague', 'Child', 'Other'];
  
  const loadingTexts = [
    "Analyzing Context...",
    "Synthesizing Vibe...",
    "Curating Luxuries..."
  ];

  // Effects
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (relationshipDropdownRef.current && !relationshipDropdownRef.current.contains(event.target as Node)) {
        setIsRelationshipDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Loading Text Cycle Effect
  useEffect(() => {
    if (!isLoading) {
      setLoadingTextIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500); // Switch text every 1.5s
    
    return () => clearInterval(interval);
  }, [isLoading]);

  // File Handlers
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please ensure the file is an image format (JPG, PNG).");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleQuizChange = (field: keyof QuizAnswers, value: string) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handleBackStep = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (mode === 'photo' && !imagePreview) {
      setError("A photo is required for visual analysis.");
      return;
    }
    if (mode === 'quiz' && (!quizData.activity || !quizData.complaint || !quizData.vibe)) {
      setError("Please complete all fields in the profile questionnaire.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let analysisResult: AnalysisResult;
      if (mode === 'photo') {
        analysisResult = await analyzeGiftProfile('photo', imagePreview as string, relationship, budget, notes);
      } else {
        analysisResult = await analyzeGiftProfile('quiz', quizData, relationship, budget, notes);
      }
      setResult(analysisResult);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setImageFile(null);
    setImagePreview(null);
    setQuizData({ activity: '', complaint: '', vibe: '' });
    setNotes('');
    setError(null);
    setStep(1);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-y-auto bg-gradient-to-br from-midnight-start to-midnight-end">
      
      {/* Brand Header - Compacted Padding */}
      <header className="pt-4 pb-1 text-center shrink-0">
        <h1 className="text-3xl md:text-4xl font-serif text-white tracking-tight mb-1">
          Gift-Glance
        </h1>
        <div className="h-0.5 w-10 bg-champagne mx-auto mb-1"></div>
        <p className="text-champagne font-sans uppercase tracking-widest text-[10px] font-semibold">
          Unwrap the perfect idea.
        </p>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 w-full max-w-lg mx-auto relative z-10 min-h-0">
        
        {/* Progress Indicator (Visible only for Steps 1 & 2) */}
        {step < 3 && !isLoading && (
          <div className="mb-2 flex flex-col items-center animate-fade-in shrink-0">
             <div className="flex items-center gap-3 mb-1">
               <div className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${step === 1 ? 'bg-champagne shadow-glow-gold scale-125' : 'bg-white/10'}`}></div>
               <div className="h-0.5 w-8 bg-white/10"></div>
               <div className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${step === 2 ? 'bg-champagne shadow-glow-gold scale-125' : 'bg-white/10'}`}></div>
             </div>
             <p className="text-champagne/60 text-[10px] uppercase tracking-widest font-bold">
               Step {step} of 2
             </p>
          </div>
        )}

        {/* LOADING STATE - AI ALCHEMY */}
        {isLoading && (
          <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center animate-fade-in w-full max-w-sm">
             
             {/* Animation Container */}
             <div className="relative w-28 h-28 mb-8 alchemy-container">
                
                {/* Central Anchor: Gift Box */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                   <div className="text-champagne drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                   </div>
                </div>

                {/* Orbit 1 */}
                <div className="orbit-plane plane-1">
                   <div className="orbit-ring spin-slow">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-champagne rounded-full shadow-glow-gold"></div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-champagne rounded-full shadow-glow-gold"></div>
                   </div>
                </div>

                {/* Orbit 2 */}
                <div className="orbit-plane plane-2">
                   <div className="orbit-ring spin-medium">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-champagne rounded-full shadow-glow-gold"></div>
                   </div>
                </div>

                {/* Orbit 3 */}
                <div className="orbit-plane plane-3">
                   <div className="orbit-ring spin-fast">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-champagne rounded-full shadow-glow-gold"></div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-champagne rounded-full shadow-glow-gold"></div>
                   </div>
                </div>

             </div>

             {/* Dynamic Status Text */}
             <h3 className="text-champagne font-serif text-lg tracking-widest uppercase animate-pulse text-center min-w-[200px]">
               {loadingTexts[loadingTextIndex]}
             </h3>
             
          </div>
        )}

        {/* STEP 1: CONTEXT */}
        {!isLoading && step === 1 && (
          <div className="glass-panel w-full rounded-2xl p-6 animate-slide-up flex flex-col gap-6 shadow-2xl relative border-t border-t-white/10">
            <h2 className="text-champagne font-serif text-2xl text-center">
              The Context
            </h2>
            
            <div className="space-y-6">
              {/* Relationship - Custom Dropdown */}
              <div className="flex flex-col relative" ref={relationshipDropdownRef}>
                <label className="text-xs text-white/60 uppercase tracking-wider mb-2 font-semibold">Relationship</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRelationshipDropdownOpen(!isRelationshipDropdownOpen)}
                    className="input-minimal w-full flex justify-between items-center text-lg font-serif cursor-pointer group focus:outline-none py-3"
                  >
                    <span className="text-white">{relationship}</span>
                    <span className={`text-champagne text-xs transition-transform duration-300 ${isRelationshipDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {isRelationshipDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-midnight-start/95 backdrop-blur-xl border border-champagne rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fade-in max-h-60 overflow-y-auto custom-scrollbar">
                      {relationshipOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setRelationship(opt);
                            setIsRelationshipDropdownOpen(false);
                          }}
                          className={`
                            px-5 py-3 text-left transition-all duration-200 flex items-center justify-between
                            ${relationship === opt ? 'bg-white/5' : 'hover:bg-champagne/20'}
                          `}
                        >
                          <span className={`${relationship === opt ? 'text-champagne font-bold' : 'text-soft-white'}`}>
                            {opt}
                          </span>
                          {relationship === opt && (
                            <span className="text-champagne text-sm">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div className="flex flex-col pt-2">
                <div className="flex justify-between items-end mb-4">
                  <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">Target Budget</label>
                  <span className="text-2xl font-serif text-champagne">
                    Up to {budget >= 500 ? "$500+" : `$${budget}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNextStep}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-champagne to-champagne-dark text-midnight-start font-bold tracking-widest uppercase hover:shadow-glow-gold transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Next: Provide Clues <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INSIGHT (Compacted Layout) */}
        {!isLoading && step === 2 && (
          <div className="glass-panel w-full rounded-2xl p-5 animate-slide-up flex flex-col gap-2 shadow-2xl border-t border-t-white/10 relative">
            
            {/* Back Link - Positioned tighter */}
            <button 
              onClick={handleBackStep}
              className="absolute top-4 left-4 text-white/40 hover:text-champagne text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 z-20"
            >
              ← Back
            </button>

            {/* Toggle Centered - Compact margins */}
            <div className="flex justify-center mb-0 mt-1">
               <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                  <button
                    onClick={() => setMode('photo')}
                    className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                      mode === 'photo' ? 'bg-champagne text-midnight-start shadow-glow-gold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setMode('quiz')}
                    className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                      mode === 'quiz' ? 'bg-champagne text-midnight-start shadow-glow-gold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Profile
                  </button>
                </div>
            </div>

            <h2 className="text-champagne font-serif text-xl text-center mb-0">
              The Insight
            </h2>

            {mode === 'photo' ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative rounded-xl border border-dashed transition-all duration-300 h-32 flex flex-col items-center justify-center cursor-pointer overflow-hidden
                  ${isDragging ? 'border-champagne bg-champagne/10' : 'border-champagne/40 hover:border-champagne hover:bg-white/5'}
                  ${imagePreview ? 'border-solid border-white/20' : ''}
                `}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity hover:bg-black/50">
                       <span className="text-white font-bold text-xs tracking-widest border border-white/50 px-4 py-2 rounded-full backdrop-blur-md">CHANGE PHOTO</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-10 h-10 rounded-full border border-champagne/30 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-champagne" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-white font-medium text-xs">Upload Photo</p>
                    <p className="text-white/40 text-[10px] mt-0.5">Their everyday space, desk setup, or a personal photo.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-champagne text-[9px] font-bold uppercase tracking-wider mb-0.5">
                    What activity consumes 4+ hours of their day?
                  </label>
                  <input 
                    type="text" 
                    value={quizData.activity}
                    onChange={(e) => handleQuizChange('activity', e.target.value)}
                    placeholder="e.g. Coding, Gaming, Cooking"
                    className="input-minimal w-full font-serif text-base placeholder:font-sans placeholder:text-xs placeholder:opacity-50 py-1"
                  />
                </div>
                <div>
                  <label className="block text-champagne text-[9px] font-bold uppercase tracking-wider mb-0.5">
                    What specific problem or inconvenience do they face?
                  </label>
                  <input 
                    type="text" 
                    value={quizData.complaint}
                    onChange={(e) => handleQuizChange('complaint', e.target.value)}
                    placeholder="e.g. Cold coffee, Back pain, Lost keys"
                    className="input-minimal w-full font-serif text-base placeholder:font-sans placeholder:text-xs placeholder:opacity-50 py-1"
                  />
                </div>
                <div>
                  <label className="block text-champagne text-[9px] font-bold uppercase tracking-wider mb-0.5">
                    Describe their aesthetic in 3 words
                  </label>
                  <input 
                    type="text" 
                    value={quizData.vibe}
                    onChange={(e) => handleQuizChange('vibe', e.target.value)}
                    placeholder="e.g. Minimalist, Chaos, Cozy"
                    className="input-minimal w-full font-serif text-base placeholder:font-sans placeholder:text-xs placeholder:opacity-50 py-1"
                  />
                </div>
              </div>
            )}
            
            {/* Optional Notes */}
             <input 
               type="text" 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="+ Add notes (optional)"
               className="input-minimal w-full text-xs text-white/70 placeholder:text-white/30 text-center py-1"
             />

            {error && (
              <div className="text-center text-red-300 text-xs font-medium bg-red-900/20 py-2 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-champagne to-champagne-dark text-midnight-start font-bold tracking-widest uppercase hover:shadow-glow-gold transform hover:-translate-y-0.5 transition-all duration-300 text-sm"
            >
              Find Perfect Gifts
            </button>
          </div>
        )}

        {/* STEP 3: RESULTS (Scrollable but contained) */}
        {!isLoading && step === 3 && result && (
          <div className="w-full h-full flex flex-col animate-slide-up">
            <div className="glass-panel w-full rounded-2xl flex flex-col max-h-[75vh] shadow-2xl overflow-hidden">
               {/* Fixed Header of Result Card */}
               <div className="p-6 border-b border-white/10 text-center bg-midnight-start/50 backdrop-blur-md shrink-0">
                  <span className="text-champagne text-[10px] uppercase tracking-widest border border-champagne/30 px-3 py-1 rounded-full">
                    Analysis Complete
                  </span>
                  <h3 className="mt-3 text-2xl font-serif text-white">{result.persona}</h3>
               </div>

               {/* Scrollable Content */}
               <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {result.gifts.map((gift, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/5 p-5 rounded-xl border-l-2 border-l-champagne hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-champagne font-bold text-[10px] uppercase tracking-widest">
                          {gift.category}
                        </span>
                        <a 
                          href={gift.amazon_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white/40 hover:text-champagne transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                      </div>
                      <h4 className="text-lg font-serif text-white mb-2">
                        {gift.item_name}
                      </h4>
                      <p className="text-white/70 text-sm leading-relaxed font-light">
                        {gift.reasoning}
                      </p>
                    </div>
                  ))}
               </div>

               {/* Footer Action */}
               <div className="p-4 border-t border-white/10 text-center bg-midnight-start/50 backdrop-blur-md shrink-0">
                  <button 
                    onClick={reset}
                    className="text-white/50 text-xs hover:text-white transition-colors uppercase tracking-widest font-semibold hover:border-b hover:border-white pb-0.5"
                  >
                    Start New Consultation
                  </button>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;