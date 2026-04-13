import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowRight, Upload, Camera, Ruler, User, Sparkles, Check, ChevronLeft, ChevronRight, X, Home, Star, Phone, Mail, MapPin, Clock, Hash, FileText, Image as ImageIcon, Maximize, Info } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────
const CLOSET_TYPES = [
  { id: "walk-in", label: "Walk-In Closet", icon: "🚪", desc: "A full room or large space you walk into" },
  { id: "reach-in", label: "Reach-In Closet", icon: "📦", desc: "Standard closet with sliding or hinged doors" },
  { id: "wardrobe-wall", label: "Wardrobe Wall", icon: "🏗️", desc: "Built-in wall unit or freestanding wardrobe system" },
  { id: "mudroom", label: "Mudroom / Entry", icon: "🏠", desc: "Entryway or mudroom storage area" },
  { id: "pantry", label: "Pantry Storage", icon: "🍽️", desc: "Kitchen pantry or utility storage" },
];

const CONSTRAINTS = [
  "Sloped ceiling", "Window", "Electrical outlet", "Vent/HVAC",
  "Door swing", "Attic access", "Pipe/plumbing", "Other obstruction"
];

const STYLE_TAGS = [
  "Modern white built-ins", "Warm wood tones", "Dark & moody", "Bright & airy",
  "Boutique feel", "Minimalist", "Family functional", "Luxury walk-in",
  "Industrial", "Scandinavian", "Traditional", "Custom mixed"
];

const MOCK_DESIGN_SUMMARY = [
  "Double-hang sections for everyday clothing",
  "Drawer tower center island with soft-close hardware",
  "Open shelving above for bags and seasonal items",
  "Dedicated shoe wall with angled display shelves",
  "Integrated LED lighting with warm tone",
  "Matte white finish with brushed gold hardware"
];

// ─── Helper: generate a project ID ──────────────────────────────────────
const generateProjectId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "CI-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

// ─── Placeholder image component ────────────────────────────────────────
const PlaceholderImg = ({ label, className = "", gradient = "from-slate-700 to-slate-900" }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl flex flex-col items-center justify-center text-white/60 ${className}`}>
    <ImageIcon size={48} strokeWidth={1} className="mb-3 text-white/30" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

// ─── File upload zone ───────────────────────────────────────────────────
const UploadZone = ({ onFiles, multiple = false, accept = "image/*", children, className = "" }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) onFiles(files);
  }, [onFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer transition-all duration-200 ${dragging ? "ring-2 ring-amber-400 bg-amber-50/10" : ""} ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length) onFiles(files);
        }}
      />
      {children}
    </div>
  );
};

// ─── Image preview thumbnail ────────────────────────────────────────────
const ImageThumb = ({ file, onRemove }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="relative group rounded-xl overflow-hidden aspect-square bg-slate-800">
      {url && <img src={url} alt="" className="w-full h-full object-cover" />}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-2 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={14} className="text-white" />
      </button>
    </div>
  );
};

// ─── Progress bar ───────────────────────────────────────────────────────
const ProgressBar = ({ step, total }) => (
  <div className="flex items-center gap-2 w-full max-w-md mx-auto mb-8">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className="flex-1 flex items-center gap-2">
        <div className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i < step ? "bg-amber-500" : i === step ? "bg-amber-400/60" : "bg-white/10"}`} />
      </div>
    ))}
    <span className="text-xs text-white/40 ml-2 whitespace-nowrap">{step + 1} of {total}</span>
  </div>
);

// ─── Step wrapper ───────────────────────────────────────────────────────
const StepShell = ({ title, subtitle, children, onBack, onNext, nextLabel = "Continue", nextDisabled = false, step, totalSteps }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col">
    <div className="w-full max-w-2xl mx-auto px-5 pt-8 pb-24 flex-1">
      <ProgressBar step={step} total={totalSteps} />
      <h2 className="text-2xl font-semibold text-white mb-1">{title}</h2>
      {subtitle && <p className="text-white/50 text-sm mb-8">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-white/5 px-5 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <ChevronLeft size={16} /> Back
          x-1">
      <ProgressBar step={step} total={totalSteps} />
      <h2 className="text-2xl font-semibold text-white mb-1">{title}</h2>
      {subtitle && <p className="text-white/50 text-sm mb-8">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-white/5 px-5 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <ChevronLeft size={16} /> Back
          </button>
        ) : <div />}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
            nextDisabled
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
          }`}
        >
          {nextLabel} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════════════════
export default function ClosetInspoApp() {
  const [screen, setScreen] = useState("landing"); // landing | wizard | generating | result
  const [step, setStep] = useState(0);
  const totalSteps = 5;

  // Wizard state
  const [closetType, setClosetType] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [inspoPhotos, setInspoPhotos] = useState([]);
  const [dimensions, setDimensions] = useState({ width: "", depth: "", height: "", unit: "inches" });
  const [constraints, setConstraints] = useState([]);
  const [notes, setNotes] = useState("");
  const [styleTags, setStyleTags] = useState([]);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", zip: "" });
  const [projectId] = useState(generateProjectId);

  const goNext = () => {
    if (step < totalSteps - 1) setStep(s => s + 1);
    else {
      setScreen("generating");
      setTimeout(() => setScreen("result"), 3500);
    }
  };
  const goBack = () => step > 0 && setStep(s => s - 1);

  // ─── Landing ────────────────────────────────────────────────────────
  if (screen === "landing") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Home size={16} className="text-slate-950" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Closet Inspo</span>
          </div>
          <button
            onClick={() => setScreen("wizard")}
            className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Start a Project →
          </button>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-medium px-4 py-2 rounded-full mb-8 border border-amber-500/20">
            <Sparkles size={14} /> Free closet concept in under 2 minutes
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            See your dream closet<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">before you build it</span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mb-10 leading-relaxed">
            Upload a photo of your current closet, share a few inspirations, and get a personalized design concept — ready for a professional to bring to life.
          </p>

          <button
            onClick={() => setScreen("wizard")}
            className="group flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 px-8 py-4 rounded-full text-base font-semibold transition-all duration-200 shadow-xl shadow-amber-500/25 hover:shadow-amber-400/30"
          >
            Start My Closet Project
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-xs text-white/30 mt-6">No account needed · Takes about 2 minutes · 100% free</p>
        </div>

        {/* Social proof */}
        <div className="border-t border-white/5 py-8 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/30 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-950" />
                ))}
              </div>
              <span>500+ closets reimagined</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-amber-500 text-amber-500" />)}
    solute inset-0 m-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Creating your concept</h2>
        <p className="text-white/40 text-sm text-center max-w-sm">
          Blending your space, style preferences, and inspiration photos into a personalized closet concept…
        </p>
        <div className="mt-8 flex items-center gap-3 text-xs text-white/20">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Analyzing your closet dimensions
        </div>
      </div>
    );
  }

  // ─── Result screen ──────────────────────────────────────────────────
  if (screen === "result") {
    const selectedType = CLOSET_TYPES.find(t => t.id === closetType);
    return (
      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Home size={16} className="text-slate-950" />
            </div>
            <span className="text-white font-semibold">Closet Inspo</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 font-mono">{projectId}</span>
            <button
              onClick={() => { setScreen("landing"); setStep(0); }}
              className="text-sm text-amber-400 hover:text-amber-300 font-medium"
            >
              Start New
            </button>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-5 py-10">
          {/* Success banner */}
          <div className="flex items-start gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Your closet concept is ready!</h3>
              <p className="text-white/50 text-sm">A design specialist will review your project and reach out within 1 business day to discuss next steps.</p>
            </div>
          </div>

          {/* Concept image */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" /> Your Closet Concept
            </h3>
            <PlaceholderImg
              label="AI-generated concept image will appear here"
              className="w-full aspect-video"
              gradient="from-amber-950/40 via-slate-800 to-slate-900"
            />
            <p className="text-xs text-white/30 mt-3 flex items-center gap-1">
              <Info size={12} /> This is a conceptual visualization. Final design depends on professional measurement and consultation.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Design direction */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <h3 className="text-base font-semibold text-white mb-4">Design Direction</h3>
              <div className="space-y-3">
                {MOCK_DESIGN_SUMMARY.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-amber-400" />
                    </div>
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              {styleTags.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <p className="text-xs text-white/30 mb-2">Style preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {styleTags.map(tag => (
                      <span key={tag} className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Space details */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <h3 className="text-base font-semibold text-white mb-4">Space Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Hash size={14} className="text-white/40" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Closet Type</p>
                    <p className="text-sm text-white">{selectedType?.label || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Maximize size={14} className="text-white/40" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Dimensions ({dimensions.unit})</p>
                    <p className="text-sm text-white">
                      {dimensions.width || "—"} W × {dimensions.depth || "—"} D × {dimensions.height || "—"} H
                    </p>
                  </div>
                </div>
                {constraints.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Info size={14} className="text-white/40" />
                    </div>
                    <div>
                      <p className="text-xs text-white/30">Constraints</p>
                      <p className="text-sm text-white">{constraints.join(", ")}</p>
                    </div>
                  </div>
                )}
                {notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-white/40" />
                    </div>
                    <div>
                      <p className="text-xs text-white/30">Notes</p>
                      <p className="text-sm text-white/70">{notes}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-xs text-white/30 italic">Measurements are customer-provided estimates. Professional verification required before final design.</p>
              </div>
            </div>
          </div>

          {/* Lead summary (designer view) */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/5 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Lead Summary</h3>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 font-mono">{projectId}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User size={16} className="text-white/30" />
                <span className="text-sm text-white">{contact.name || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-white/30" />
                <span className="text-sm text-white">{contact.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-white/30" />
                <span className="text-sm text-white">{contact.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-white/30" />
                <span className="text-sm text-white">{contact.zip || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-white/30" />
                <span className="text-sm text-white/50 text-xs">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <ImageIcon size={16} className="text-white/30" />
                <span className="text-sm text-white/50 text-xs">{1 + inspoPhotos.length} photo(s) uploaded</span>
              </div>
            </div>
          </div>

          {/* Uploaded photos */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4">Uploaded Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {currentPhoto && (
                <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-800">
                  <ImageThumb file={currentPhoto} onRemove={() => {}} />
                  <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded-full">Current</span>
                </div>
              )}
              {inspoPhotos.map((f, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-slate-800">
                  <ImageThumb file={f} onRemove={() => {}} />
                  <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded-full">Inspo {i + 1}</span>
                </div>
              ))}
              {!currentPhoto && inspoPhotos.length === 0 && (
                <p className="text-sm text-white/30 col-span-4">No photos uploaded in this demo</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Wizard Steps ───────────────────────────────────────────────────
   // Step 0: Closet type
  if (step === 0) {
    return (
      <StepShell
        title="What type of space are you working with?"
        subtitle="Select the option that best describes your closet or storage area."
        step={step} totalSteps={totalSteps}
        onNext={goNext}
        nextDisabled={!closetType}
      >
        <div className="grid gap-3">
          {CLOSET_TYPES.map(type => (
            <button
                key={type.id}
              onClick={() => setClosetType(type.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                closetType === type.id
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <div>
                <p className={`font-medium text-sm ${closetType === type.id ? "text-amber-400" : "text-white"}`}>{type.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{type.desc}</p>
              </div>
              {closetType === type.id && (
                <div className="ml-auto w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-slate-950" />
                </div>
              )}
            </button>
          ))}
        </div>
      </StepShell>
    );
  }

  // Step 1: Current closet photo
  if (step === 1) {
    return (
      <StepShell
        title="Upload a photo of your current closet"
        subtitle="This helps us understand your space. A straight-on photo works best."
        step={step} totalSteps={totalSteps}
        onBack={goBack} onNext={goNext}
        nextDisabled={false}
        nextLabel={currentPhoto ? "Continue" : "Skip for now"}
      >
        {currentPhoto ? (
          <div className="relative">
            <ImageThumb file={currentPhoto} onRemove={() => setCurrentPhoto(null)} />
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
              <Check size={16} /> Photo uploaded
            </div>
          </div>
        ) : (
          <UploadZone onFiles={(files) => setCurrentPhoto(files[0])} className="block">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center hover:border-amber-500/30 hover:bg-amber-500/5 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Camera size={28} className="text-white/30" />
              </div>
              <p className="text-white/60 text-sm font-medium mb-1">Tap to upload or drag a photo here</p>
              <p className="text-white/30 text-xs">JPG, PNG up to 10MB</p>
            </div>
          </UploadZone>
        )}

        <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-white-40 font-medium mb-2">📸 Tips for a great photo</p>
          <div className="text-xs text-white/30 space-y-1">
            <p>• Stand back and capture the full opening or room</p>
            <p>• Include the floor and ceiling if possible</p>
            <p>• Turn on all lights for best visibility</p>
            <p>• Don't worry about mess — we're looking at the space, not the stuff!</p>
          </div>
        </div>
      </StepShell>
    );
  }

  // Step 2: Inspiration photos + style
  if (step === 2) {
    return (
      <StepShell
        title="Show us what you love"
        subtitle="Upload 1–3 inspiration photos and pick style tags that speak to you."
        step={step} totalSteps={totalSteps}
        onBack={goBack} onNext={goNext}
        nextLabel={inspoPhotos.length > 0 || styleTags.length > 0 ? "Continue" : "Skip for now"}
      >
        <div className="grid grid-cols-3 gap-3 mb-6">
          {inspoPhotos.map((f, i) => (
            <ImageThumb key={i} file={f} onRemove={() => setInspoPhotos(p => p.filter((_, j) => j !== i))} />
          ))}
          {inspoPhotos.length < 3 && (
            <UploadZone
              multiple
              onFiles={(files) => setInspoPhotos(p => [...p, ...files].slice(0, 3))}
              className="block"
            >
              <div className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:border-amber-500/30 hover:bg-amber-500/5 transition-all">
                <Upload size={20} className="text-white/20 mb-2" />
                <span className="text-xs text-white/30">Add photo</span>
              </div>
            </UploadZone>
          )}
        </div>

        <p className="text-sm text-white/50 mb-3">Or pick styles you're drawn to:</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setStyleTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              className={`text-xs px-3 py-2 rounded-full border transition-all ${
                styleTags.includes(tag)
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </StepShell>
    );
  }

  // Step 3: Dimensions
  if (step === 3) {
    const dimValid = dimensions.width && dimensions.height;
    return (
      <StepShell
        title="Tell us about the space"
        subtitle="Rough measurements are fine — a designer will verify later."
        step={step} totalSteps={totalSteps}
        onBack={goBack} onNext={goNext}
        nextDisabled={!dimValid}
      >
        {/* Unit toggle */}
        <div className="flex items-center gap-2 mb-6">
          {["inches", "feet", "cm"].map(u => (
            <button
              key={u}
              onClick={() => setDimensions(d => ({ ...d, unit: u }))}
              className={`text-xs px-4 py-2 rounded-full border transition-all ${
                dimensions.unit === u
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-white/10 text-white/40 hover:border-white/20"
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { key: "width", label: "Width", required: true },
            { key: "depth", label: "Depth", required: false },
            { key: "height", label: "Height", required: true },
          ].map(({ key, label, required }) => (
            <div key={key}>
              <label className="text-xs text-white/40 mb-1.5 block">
                {label} {required && <span className="text-amber-500">*</span>}
              </label>
              <input
                type="number"
                value={dimensions[key]}
                onChange={(e) => setDimensions(d => ({ ...d, [key]: e.target.value }))}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>
          ))}
        </div>

        {/* Constraints */}
        <p className="text-sm text-white/50 mb-3">Any space constraints?</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {CONSTRAINTS.map(c => (
            <button
              key={c}
              onClick={() => setConstraints(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
              className={`text-xs px-3 py-2 rounded-full border transition-all ${
                constraints.includes(c)
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-white/10 text-white/40 hover:border-white/20"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-white/40 mb-1.5 block">Anything else we should know?</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., I need lots of shoe storage, the left wall has an outlet…"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
          />
        </div>

        <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-white/40 font-medium mb-2">📏 How to measure</p>
          <div className="text-xs text-white/30 space-y-1">
            <p>• <strong className="text-white/50">Width:</strong> Wall to wall across the opening or inside</p>
            <p>• <strong className="text-white/50">Depth:</strong> Front to back wall (for walk-ins)</p>
            <p>• <strong className="text-white/50">Height:</strong> Floor to ceiling</p>
            <p>• Don't have a tape measure? Use a broom handle or your arm span to estimate!</p>
          </div>
        </div>
      </StepShell>
    );
  }

  // Step 4: Contact info
  if (step === 4) {
    const contactValid = contact.name && contact.email;
    return (
      <StepShell
        title="Almost there! How can we reach you?"
        subtitle="A designer will review your concept and follow up within 1 business day."
        step={step} totalSteps={totalSteps}
        onBack={goBack} onNext={goNext}
        nextLabel="Generate My Concept ✨"
        nextDisabled={!contactValid}
      >
        <div className="space-y-4">
          {[
            { key: "name", label: "Full Name", type: "text", placeholder: "Jane Smith", required: true, icon: User },
            { key: "email", label: "Email", type: "email", placeholder: "jane@example.com", required: true, icon: Mail },
            { key: "phone", label: "Phone", type: "tel", placeholder: "(555) 123-4567", required: false, icon: Phone },
            { key: "zip", label: "ZIP Code", type: "text", placeholder: "90210", required: false, icon: MapPin },
          ].map(({ key, label, type, placeholder, required, icon: Icon }) => (
            <div key={key}>
              <label className="text-xs text-white-40 mb-1.5 flex items-center gap-1.5">
                <Icon size={12} /> {label} {required && <span className="text-amber-500">*</span>}
              </label>
              <input
                type={type}
                value={contact[key]}
                onChange={(e) => setContact(c => ({ ...c, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-white/30 leading-relaxed">
            🔒 Your information is only shared with the design team reviewing your project. We won't spam you or sell your data.
          </p>
        </div>
      </StepShell>
    );
  }

  return null;
}
