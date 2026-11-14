import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { metaService } from '../../services/metaService';
import {
  PlusCircle,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Mic,
  MicOff,
  Radio,
  RotateCcw,
  Bot,
  Zap,
  Tag,
  Check,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';

const SubmitComplaint = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    priority: 'Medium',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechField, setActiveSpeechField] = useState(null); // 'title' | 'description'
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // AI Prediction state
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const predictDebounceRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await metaService.getCategories();
        if (res.success && res.categories) {
          setCategories(res.categories);
          if (res.categories.length > 0) {
            setFormData(prev => ({ ...prev, category_id: res.categories[0]._id }));
            setSelectedCategory(res.categories[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();

    // Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Trigger AI prediction debounced when title or description changes
  const triggerPrediction = (title, description) => {
    const combined = `${title} ${description}`.trim();
    if (combined.length < 5) {
      setPrediction(null);
      return;
    }

    if (predictDebounceRef.current) {
      clearTimeout(predictDebounceRef.current);
    }

    predictDebounceRef.current = setTimeout(async () => {
      setPredicting(true);
      try {
        const res = await complaintService.predictDepartment({ title, description });
        if (res.success && res.prediction && res.prediction.category_id) {
          setPrediction(res.prediction);
        }
      } catch (err) {
        console.error('AI Prediction error:', err);
      } finally {
        setPredicting(false);
      }
    }, 600);
  };

  // Apply AI Prediction recommendation
  const applyPrediction = (pred = prediction) => {
    if (!pred || !pred.category_id) return;
    const cat = categories.find(c => String(c._id) === String(pred.category_id));
    if (cat) {
      setFormData(prev => ({ ...prev, category_id: String(cat._id) }));
      setSelectedCategory(cat);
    }
  };

  // Initialize and trigger speech recognition for a specific field
  const startListening = (field = 'description') => {
    setError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setActiveSpeechField(field);
        setSpeechTranscript('');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            if (field === 'title') {
              setFormData(prev => {
                const newTitle = prev.title ? `${prev.title} ${transcriptChunk}`.trim() : transcriptChunk.trim();
                triggerPrediction(newTitle, prev.description);
                return { ...prev, title: newTitle };
              });
            } else {
              setFormData(prev => {
                const newDesc = prev.description ? `${prev.description} ${transcriptChunk}`.trim() : transcriptChunk.trim();
                triggerPrediction(prev.title, newDesc);
                return { ...prev, description: newDesc };
              });
            }
          } else {
            currentTranscript += transcriptChunk;
          }
        }
        setSpeechTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error !== 'no-speech') {
          setError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
        setActiveSpeechField(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveSpeechField(null);
        setSpeechTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Could not access microphone. Please check your browser permissions.');
      setIsListening(false);
      setActiveSpeechField(null);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setActiveSpeechField(null);
    setSpeechTranscript('');
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find(c => String(c._id) === catId);
    setFormData({ ...formData, category_id: catId });
    setSelectedCategory(cat || null);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData({ ...formData, title: newTitle });
    triggerPrediction(newTitle, formData.description);
  };

  const handleDescriptionChange = (e) => {
    const newDesc = e.target.value;
    setFormData({ ...formData, description: newDesc });
    triggerPrediction(formData.title, newDesc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isListening) stopListening();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await complaintService.createComplaint(formData);
      if (res.success) {
        setSuccessMsg(res.message || 'Complaint submitted successfully!');
        setTimeout(() => {
          navigate(`/student/complaints/${res.complaint._id}`);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const getDeptName = (cat) => {
    if (!cat) return '';
    if (cat.dept_id && typeof cat.dept_id === 'object') return cat.dept_id.dept_name || '';
    return cat.dept_name || '';
  };

  const isCurrentCategoryPredicted =
    prediction && selectedCategory && String(selectedCategory._id) === String(prediction.category_id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/student/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Register New Complaint</h1>
          <p className="text-xs text-slate-500">AI-assisted department routing, voice dictation, and real-time category matching</p>
        </div>

        {/* Feature Badges */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Auto-Routing</span>
          </div>
          {speechSupported && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Mic className="w-3.5 h-3.5 text-blue-600" />
              <span>Voice Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Voice Assistant Banner */}
      {speechSupported && (
        <div className={`p-4 rounded-2xl border transition-all ${
          isListening
            ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-white border-purple-500 shadow-lg shadow-purple-500/20'
            : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-purple-200/80 text-purple-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/40'
                  : 'bg-purple-600 text-white shadow-xs'
              }`}>
                {isListening ? <Radio className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Speech-to-Text Recognition</span>
                  {isListening && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse">
                      LISTENING...
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${isListening ? 'text-purple-200' : 'text-purple-700'}`}>
                  {isListening
                    ? `Speaking into ${activeSpeechField === 'title' ? 'Subject' : 'Description'}... Speak clearly into your mic.`
                    : 'Speak naturally to record your grievance title or description without typing.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isListening ? (
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <MicOff className="w-3.5 h-3.5" />
                  Stop Voice Input
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startListening('description')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Dictate Description
                </button>
              )}
            </div>
          </div>

          {/* Live speech transcript preview */}
          {isListening && speechTranscript && (
            <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/20 text-xs font-mono text-emerald-300">
              <span className="text-purple-300 font-sans font-bold block mb-1">Transcribing:</span>
              "{speechTranscript}"
            </div>
          )}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* AI Department Prediction Card */}
        {prediction && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border border-purple-500/40 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <BrainCircuit className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      AI Department Prediction
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                      {prediction.confidence} Confidence
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Suggested: <span className="text-purple-200">{prediction.category_name}</span> &rarr;{' '}
                    <span className="text-brand-300 font-extrabold">{prediction.dept_name}</span>
                  </h4>
                  {prediction.matched_keywords && prediction.matched_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                      <span className="text-[10px] text-purple-300">Detected Keywords:</span>
                      {prediction.matched_keywords.map((kw, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono text-purple-200 border border-white/10">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="self-start sm:self-auto shrink-0">
                {isCurrentCategoryPredicted ? (
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    Applied
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyPrediction(prediction)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    Auto-Select Category
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Complaint Title / Subject */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Complaint Subject / Title <span className="text-rose-500">*</span>
              </label>

              {speechSupported && (
                <button
                  type="button"
                  onClick={() => {
                    if (isListening && activeSpeechField === 'title') {
                      stopListening();
                    } else {
                      startListening('title');
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isListening && activeSpeechField === 'title'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                  title="Speak Subject using voice recognition"
                >
                  {isListening && activeSpeechField === 'title' ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-600" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-purple-600" />
                      <span>Speak Title</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g. Wi-Fi router disconnected in Computer Lab 3 / Bench broken in Hall 2"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium ${
                isListening && activeSpeechField === 'title'
                  ? 'border-purple-500 ring-2 ring-purple-400/30'
                  : 'border-slate-300 focus:ring-brand-500'
              }`}
            />
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Description <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-2">
                {formData.description && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, description: '' });
                      triggerPrediction(formData.title, '');
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                    title="Clear text"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}

                {speechSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening && activeSpeechField === 'description') {
                        stopListening();
                      } else {
                        startListening('description');
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isListening && activeSpeechField === 'description'
                        ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    }`}
                    title="Dictate Description using voice recognition"
                  >
                    {isListening && activeSpeechField === 'description' ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-600" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-purple-600" />
                        <span>Speak Description</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Speak or type exact location, symptoms, lab/room number, and any relevant details (e.g. Wi-Fi SSID dropped, projector bulb fuse blown, tap water leaking)..."
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium ${
                  isListening && activeSpeechField === 'description'
                    ? 'border-purple-500 ring-2 ring-purple-400/30'
                    : 'border-slate-300 focus:ring-brand-500'
                }`}
              />

              {isListening && activeSpeechField === 'description' && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  REC
                </div>
              )}
            </div>
          </div>

          {/* Category Selector with AI Assistance */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assigned Category / Issue Type <span className="text-rose-500">*</span>
              </label>

              {predicting && (
                <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Analyzing text for department routing...
                </span>
              )}
            </div>

            <select
              value={formData.category_id}
              onChange={handleCategoryChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
            >
              <option value="" disabled>-- Select an issue type --</option>
              {categories.map((cat) => (
                <option key={String(cat._id)} value={String(cat._id)}>
                  {cat.category_name} — {getDeptName(cat)} Department
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Automatic Routing Highlight Box */}
          {selectedCategory && (
            <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 text-brand-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-brand-600 text-white shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-brand-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Automatic Department Routing
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    Concerned Department: <span className="text-brand-700">{getDeptName(selectedCategory)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs bg-white/80 border border-brand-200 px-3 py-1.5 rounded-lg text-slate-600 flex items-center gap-1.5 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Target SLA: <strong>{selectedCategory.sla_hours || 48} hrs</strong></span>
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Urgency / Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Low', 'Medium', 'High', 'Critical'].map((pri) => (
                <label
                  key={pri}
                  className={`flex items-center justify-center p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    formData.priority === pri
                      ? pri === 'Critical'
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                        : pri === 'High'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : pri === 'Medium'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={pri}
                    checked={formData.priority === pri}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="sr-only"
                  />
                  <span>{pri}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              to="/student/dashboard"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.category_id}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/30 flex items-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
