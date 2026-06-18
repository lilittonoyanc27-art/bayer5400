import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DICTIONARY, Word } from "./dictionaryData";
import Flashcards from "./Flashcards";
import WordMatch from "./WordMatch";
import TriviaQuiz from "./TriviaQuiz";
import LetterScramble from "./LetterScramble";
import MemoryGrid from "./MemoryGrid";
import { Search, BookOpen, Sparkles, CheckCircle2, Volume2, HelpCircle, Trophy, Gamepad2, ListFilter, Trash2 } from "lucide-react";

type ActiveTab = "dictionary" | "flashcards" | "match" | "quiz" | "scramble" | "memo";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dictionary");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Բոլորը");
  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 12;

  // Track total learned vocabulary across components from localStorage
  const [learnedCount, setLearnedCount] = useState(() => {
    const saved = localStorage.getItem("armesp_learned_ids");
    return saved ? JSON.parse(saved).length : 0;
  });

  const syncLearnedCount = () => {
    const saved = localStorage.getItem("armesp_learned_ids");
    setLearnedCount(saved ? JSON.parse(saved).length : 0);
  };

  // Listen to state sync on trigger
  useState(() => {
    const interval = setInterval(syncLearnedCount, 1000);
    return () => clearInterval(interval);
  });

  // Categories list
  const categories = useMemo(() => {
    return ["Բոլորը", ...Array.from(new Set(DICTIONARY.map((w) => w.category)))];
  }, []);

  // Filter dictionary words
  const filteredWords = useMemo(() => {
    setCurrentPage(1);
    return DICTIONARY.filter((w) => {
      const matchSearch =
        w.am.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.es.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "Բոլորը" || w.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Paginated words list
  const paginatedWords = useMemo(() => {
    const startIndex = (currentPage - 1) * wordsPerPage;
    return filteredWords.slice(startIndex, startIndex + wordsPerPage);
  }, [filteredWords, currentPage]);

  const totalPages = Math.ceil(filteredWords.length / wordsPerPage);

  // Play auditory Spanish translation
  const speakSpanish = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleResetLearned = () => {
    if (confirm("Վստա՞հ եք, որ ցանկանում եք զրոյացնել ձեր սովորած բառերի ցանկը:")) {
      localStorage.removeItem("armesp_learned_ids");
      setLearnedCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/40 pb-16 font-sans text-slate-800 selection:bg-indigo-150 selection:text-indigo-900" id="main-applet-container">
      
      {/* Top Stylish Branding Header Banner */}
      <header className="bg-white px-6 md:px-12 py-5 flex flex-col gap-4 md:flex-row justify-between items-center shadow-sm border-b-4 border-indigo-150/60" id="header-banner">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-3 transition-transform">
            <span className="text-white font-black text-2xl">A</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-indigo-900">
              ARM-ESP <span className="text-orange-500 underline decoration-4 underline-offset-4">LINGO</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              Իսպաներենի խաղային ակադեմիա
            </p>
          </div>
        </div>

        {/* Dynamic Dual Flag Connection Center Switcher */}
        <div className="flex items-center bg-indigo-100/70 rounded-full px-4 py-2 gap-4 border-2 border-indigo-200/50">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="33" fill="#EE1C25" />
              <rect y="33" width="100" height="33" fill="#0033A0" />
              <rect y="66" width="100" height="34" fill="#F2A800" />
            </svg>
            <span className="font-extrabold text-xs text-indigo-950">ARM</span>
          </div>
          <div className="text-indigo-400 font-extrabold">→</div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="33" fill="#AD1519" />
              <rect y="33" width="100" height="33" fill="#FABD00" />
              <rect y="66" width="100" height="34" fill="#AD1519" />
            </svg>
            <span className="font-extrabold text-xs text-indigo-950">ESP</span>
          </div>
        </div>

        {/* Quick stats board */}
        <div className="flex items-center gap-4 bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 shrink-0 self-stretch md:self-auto" id="user-progress-panel">
          <div className="text-right">
            <span className="text-[9px] text-indigo-400 uppercase font-black tracking-wider block">Սովորած բառապաշար</span>
            <span className="text-base font-black text-orange-600" id="global-learned-stat">
              🔥 {learnedCount} / {DICTIONARY.length} Բառ
            </span>
          </div>
          <div className="h-8 w-px bg-indigo-200" />
          <div className="relative w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-full border-4 border-white shadow-md">
            <span className="text-[10px] font-black text-white">
              {Math.round((learnedCount / DICTIONARY.length) * 100)}%
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-3 mb-8" id="navigation-tabs-row">
          
          <button
            onClick={() => setActiveTab("dictionary")}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === "dictionary"
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200/80 scale-102 transform -translate-y-0.5"
                : "bg-white text-indigo-900 border-2 border-indigo-150/40 hover:bg-indigo-100/50 hover:border-indigo-300"
            }`}
            id="tab-btn-dictionary"
          >
            <BookOpen className="w-4 h-4" /> 📂 Բառարան ({DICTIONARY.length})
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === "flashcards"
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200/80 scale-102 transform -translate-y-0.5"
                : "bg-white text-indigo-900 border-2 border-indigo-150/40 hover:bg-indigo-100/50 hover:border-indigo-300"
            }`}
            id="tab-btn-flashcards"
          >
            <Sparkles className="w-4 h-4 text-orange-500 fill-current" /> 🧠 Քարտեր
          </button>

          <button
            onClick={() => setActiveTab("match")}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === "match"
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200/80 scale-102 transform -translate-y-0.5"
                : "bg-white text-indigo-900 border-2 border-indigo-150/40 hover:bg-indigo-100/50 hover:border-indigo-300"
            }`}
            id="tab-btn-match"
          >
            <Gamepad2 className="w-4 h-4 text-blue-500 animate-pulse" /> 🔗 Գտիր Զույգը
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === "quiz"
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200/80 scale-102 transform -translate-y-0.5"
                : "bg-white text-indigo-900 border-2 border-indigo-150/40 hover:bg-indigo-100/50 hover:border-indigo-300"
            }`}
            id="tab-btn-quiz"
          >
            <Trophy className="w-4 h-4 text-emerald-500 fill-current" /> 🎓 Թեստ-Վիկտորինա
          </button>

          <button
            onClick={() => setActiveTab("scramble")}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === "scramble"
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200/80 scale-102 transform -translate-y-0.5"
                : "bg-white text-indigo-900 border-2 border-indigo-150/40 hover:bg-indigo-100/50 hover:border-indigo-300"
            }`}
            id="tab-btn-scramble"
          >
            <Sparkles className="w-4 h-4 text-purple-500" /> 🧩 Կառուցիր Բառը
          </button>

          <button
            onClick={() => setActiveTab("memo")}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === "memo"
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200/80 scale-102 transform -translate-y-0.5"
                : "bg-white text-indigo-900 border-2 border-indigo-150/40 hover:bg-indigo-100/50 hover:border-indigo-300"
            }`}
            id="tab-btn-memo"
          >
            <Gamepad2 className="w-4 h-4 text-pink-500" /> 🧠 Հիշողության Ցանց
          </button>
        </div>

        {/* Dynamic Screens Router */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full"
            id="dynamic-screen-viewport"
          >
            
            {/* ====== Tab 1: Dictionary search & card display ====== */}
            {activeTab === "dictionary" && (
              <div id="dictionary-tab-content">
                {/* Visual Cards Search panel */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-indigo-500/80 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="w-full md:max-w-md relative" id="search-input-group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      placeholder="Որոնել հայերեն կամ իսպաներեն բառեր..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-indigo-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400"
                      id="dictionary-keyword-search"
                    />
                  </div>

                  <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-end" id="filters-toolbar">
                    <div className="flex items-center gap-1 shrink-0">
                      <ListFilter className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs text-indigo-900 font-bold">Կատեգորիա՝</span>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-indigo-50/50 border-2 border-indigo-100 rounded-xl px-3 py-2 text-xs font-black text-indigo-950 focus:outline-none focus:border-indigo-400"
                      id="dictionary-category-selector"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "Բոլորը" ? "📂 Բոլոր Կատեգորիաները" : cat}
                        </option>
                      ))}
                    </select>

                    {learnedCount > 0 && (
                      <button
                        onClick={handleResetLearned}
                        className="text-xs hover:text-red-600 hover:bg-red-50 text-slate-400 font-semibold py-2 px-3 rounded-xl border border-dashed border-slate-200 hover:border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                        title="Մաքրել բոլոր սովորածների առաջընթացը"
                        id="reset-learned-progress-btn"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Զրոյացնել
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid of Dictionary Translation Cards on screen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dictionary-cards-grid">
                  {paginatedWords.map((word, idx) => {
                    const colors = [
                      { border: "border-orange-500", text: "text-orange-600" },
                      { border: "border-blue-500", text: "text-blue-600" },
                      { border: "border-emerald-500", text: "text-emerald-600" },
                      { border: "border-purple-500", text: "text-purple-600" },
                    ];
                    const styleOption = colors[idx % colors.length];

                    return (
                      <div
                        key={word.id}
                        className={`bg-white rounded-3xl p-6 shadow-xl border-b-8 ${styleOption.border} flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 h-full`}
                        id={`dict-word-card-${word.id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            📂 {word.category}
                          </span>
                          <button
                            onClick={() => speakSpanish(word.es)}
                            className="bg-indigo-50 hover:bg-indigo-200 text-indigo-600 p-2 rounded-xl transition-colors"
                            title="Արտասանել իսպաներեն"
                            id={`pronounce-dict-${word.id}`}
                          >
                            <Volume2 className="w-4 h-4 text-indigo-700" />
                          </button>
                        </div>

                        <div className="py-2">
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">🇦🇲 ՀԱՅԵՐԵՆ</span>
                          <h4 className="text-xl font-bold text-indigo-950 leading-tight mb-3">
                            {word.am}
                          </h4>

                          <div className="h-px bg-slate-100 my-2" />

                          <span className="text-[10px] uppercase font-black tracking-wider text-indigo-300 block mb-1">🇪🇸 ԻՍՊԱՆԵՐԵՆ</span>
                          <h4 className={`text-2xl font-black ${styleOption.text} font-sans leading-tight`}>
                            {word.es}
                          </h4>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-50">
                          <span>ID: {word.id}</span>
                          <span className="flex items-center gap-0.5 font-bold text-indigo-300">
                            🔊 <span className="italic select-none font-extrabold uppercase">es-ES</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginations block row */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8" id="dictionary-pagination-row">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
                      id="dictionary-page-prev"
                    >
                      Նախորդ էջ
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      Էջ {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
                      id="dictionary-page-next"
                    >
                      Հաջորդ էջ
                    </button>
                  </div>
                )}

                {/* Empty fallback search block */}
                {filteredWords.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-100" id="dictionary-search-fallback">
                    <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium">Արդյունքներ չեն գտնվել</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Փորձեք փոխել որոնման բառապաշարը կամ ընտրել այլ կատեգորիա ֆիլտրից:
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("Բոլորը");
                      }}
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all shadow-sm"
                      id="dictionary-clear-filters"
                    >
                      Մաքրել որոնումը
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ====== Tab 2: Study flashcards component ====== */}
            {activeTab === "flashcards" && <Flashcards />}

            {/* ====== Tab 3: Connect Pairs Game component ====== */}
            {activeTab === "match" && <WordMatch />}

            {/* ====== Tab 4: Trivia quiz component ====== */}
            {activeTab === "quiz" && <TriviaQuiz />}

            {/* ====== Tab 5: Letter Scramble game component ====== */}
            {activeTab === "scramble" && <LetterScramble />}

            {/* ====== Tab 6: Card memory game component ====== */}
            {activeTab === "memo" && <MemoryGrid />}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Compact Footer */}
      <footer className="text-center text-slate-400 text-xs py-8 border-t border-slate-200/50 mt-16 max-w-7xl mx-auto px-4">
        <p className="font-sans">
          © {new Date().getFullYear()} — ArmEsp Academy. Բոլոր իրավունքները պաշտպանված են:
        </p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
          🇦🇲 Իսպաներենի խորացված ուսուցում խաղային մեթոդով 🇪🇸
        </p>
      </footer>
    </div>
  );
}
