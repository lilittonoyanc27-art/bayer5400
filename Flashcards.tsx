import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DICTIONARY, Word } from "./dictionaryData";
import { Volume2, RotateCcw, Shuffle, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

export default function Flashcards() {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Բոլորը");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedIds, setLearnedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("armesp_learned_ids");
    return saved ? JSON.parse(saved) : [];
  });
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false);

  // Categories list
  const categories = ["Բոլորը", ...Array.from(new Set(DICTIONARY.map((w) => w.category)))];

  // Filter words
  useEffect(() => {
    let filtered = DICTIONARY;
    if (selectedCategory !== "Բոլորը") {
      filtered = filtered.filter((w) => w.category === selectedCategory);
    }
    if (showOnlyUnlearned) {
      filtered = filtered.filter((w) => !learnedIds.includes(w.id));
    }
    setWords(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, showOnlyUnlearned, learnedIds]);

  const currentWord = words[currentIndex] || null;

  // Save learned list
  const toggleLearned = (id: number) => {
    let updated;
    if (learnedIds.includes(id)) {
      updated = learnedIds.filter((item) => item !== id);
    } else {
      updated = [...learnedIds, id];
    }
    setLearnedIds(updated);
    localStorage.setItem("armesp_learned_ids", JSON.stringify(updated));
  };

  // Spanish pronunciation audio
  const speakSpanish = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (words.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 150);
  };

  const handlePrev = () => {
    if (words.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    }, 150);
  };

  const handleShuffle = () => {
    if (words.length === 0) return;
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleReset = () => {
    setSelectedCategory("Բոլորը");
    setShowOnlyUnlearned(false);
    setWords(DICTIONARY);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto" id="flashcards-section">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-indigo-550 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-indigo-900 tracking-tight flex items-center gap-1.5" id="fc-title">
              🧠 ուսումնական Քարտեր
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Կտտացրեք քարտին՝ իսպաներեն թարգմանությունը, կատեգորիան և արտասանությունը դիտելու համար:
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
            id="fc-reset-btn"
          >
            <RotateCcw className="w-3 md:w-3.5 h-3 md:h-3.5" /> Վերականգնել
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div id="category-filter-group">
            <label className="block text-xs font-bold text-indigo-900 mb-1.5">Ընտրել Կատեգորիան</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border-2 border-indigo-100 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-400"
              id="category-selector"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "Բոլորը" ? "📂 Բոլոր Կատեգորիաները" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end" id="unlearned-filter-group">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border-2 border-indigo-100 hover:bg-indigo-50/20 rounded-xl px-3 py-2.5 transition-colors select-none">
              <input
                type="checkbox"
                checked={showOnlyUnlearned}
                onChange={(e) => setShowOnlyUnlearned(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                id="unlearned-checkbox"
              />
              <span className="text-sm font-bold text-slate-700">Ցույց տալ չսովորածները</span>
            </label>
          </div>
        </div>

        {/* Word Deck Count */}
        <div className="flex justify-between items-center text-xs text-slate-500 mb-4" id="flashcards-info-bar">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full" id="word-count-badge">
              {words.length} բառ
            </span>
            {words.length > 0 && (
              <span id="fc-pagination-info">
                Քարտ {currentIndex + 1} -ից {words.length}
              </span>
            )}
          </div>
          <button
            onClick={handleShuffle}
            disabled={words.length <= 1}
            className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 disabled:opacity-50 transition-colors"
            id="fc-shuffle-btn"
          >
            <Shuffle className="w-3.5 h-3.5" /> Խառնել քարտերը
          </button>
        </div>

        {/* Flashcard Area */}
        {words.length > 0 && currentWord ? (
          <div>
            {/* Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="h-64 cursor-pointer relative perspective-1000 group mb-6 select-none"
              id={`deck-card-${currentWord.id}`}
            >
              {/* Actual Flip Motion Div */}
              <motion.div
                className="w-full h-full relative duration-500 rounded-3xl"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Front Side: Armenian */}
                <div
                  className="absolute inset-0 w-full h-full bg-white border-b-8 border-orange-500 rounded-3xl p-8 flex flex-col justify-between shadow-xl"
                  style={{ backfaceVisibility: "hidden" }}
                  id="card-face-front"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                      🇦🇲 ՀԱՅԵՐԵՆ
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLearned(currentWord.id);
                      }}
                      className="text-slate-400 hover:text-orange-500 transition-colors"
                      title="Նշել որպես սովորած"
                      id="learn-toggle-front"
                    >
                      {learnedIds.includes(currentWord.id) ? (
                        <BookmarkCheck className="w-6 h-6 text-orange-500" />
                      ) : (
                        <Bookmark className="w-6 h-6 text-slate-300" />
                      )}
                    </button>
                  </div>

                  <div className="text-center py-4 flex flex-col items-center justify-center">
                    <h3 className="text-3xl font-black text-indigo-950 tracking-tight font-sans leading-snug" id="fc-arm-term">
                      {currentWord.am}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500">
                      <HelpCircle className="w-3.5 h-3.5 stroke-2 text-indigo-500" /> Կտտացրեք՝ թարգմանությունը տեսնելու համար
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      {currentWord.category}
                    </span>
                  </div>
                </div>

                {/* Back Side: Spanish */}
                <div
                  className="absolute inset-x-0 inset-y-0 w-full h-full bg-white border-b-8 border-blue-500 rounded-3xl p-8 flex flex-col justify-between shadow-xl"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  id="card-face-back"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      🇪🇸 ԻՍՊԱՆԵՐԵՆ (Español)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakSpanish(currentWord.es);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 text-indigo-700 p-2 rounded-xl transition-colors shadow-sm"
                        title="Արտասանել"
                        id="voice-pronounce-btn"
                      >
                        <Volume2 className="w-4 h-4 text-indigo-800" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLearned(currentWord.id);
                        }}
                        className="text-slate-400 hover:text-orange-500 transition-colors"
                        title="Նշել որպես սովորած"
                        id="learn-toggle-back"
                      >
                        {learnedIds.includes(currentWord.id) ? (
                          <BookmarkCheck className="w-6 h-6 text-orange-500" />
                        ) : (
                          <Bookmark className="w-6 h-6 text-slate-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-center py-4 flex flex-col items-center justify-center">
                    <h3 className="text-3xl font-black text-blue-600 tracking-tight font-sans leading-snug" id="fc-esp-term">
                      {currentWord.es}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center text-xs text-indigo-400">
                    <span className="text-indigo-500">
                      🔊 Կտտացրեք արտասանության կոճակը
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      {currentWord.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation controls */}
            <div className="flex justify-between items-center px-2" id="fc-nav-controls">
              <button
                onClick={handlePrev}
                className="bg-slate-100 hover:bg-indigo-100/50 hover:text-indigo-600 text-slate-700 font-medium py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-sm"
                id="fc-prev-btn"
              >
                <ChevronLeft className="w-5 h-5" /> Նախորդ
              </button>
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-indigo-200"
                id="fc-next-btn"
              >
                Հաջորդ <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Progress indicators */}
            <div className="mt-8" id="fc-progress-bar-group">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Սովորած բառերի առաջընթացը</span>
                <span className="font-semibold text-slate-700">
                  {Math.round((learnedIds.length / DICTIONARY.length) * 100)}% ({learnedIds.length}/{DICTIONARY.length})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden" id="fc-bar bg">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (learnedIds.length / DICTIONARY.length) * 100)}%` }}
                  id="fc-bar-fill"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200" id="no-cards-fallback">
            <p className="text-slate-500 mb-3">Տվյալներ չեն գտնվել:</p>
            <p className="text-xs text-slate-400 mb-4">
              Փորձեք փոխել կատեգորիան կամ անջատել «չսովորածները» ֆիլտրը:
            </p>
            <button
              onClick={handleReset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all"
              id="no-cards-reset-btn"
            >
              Վերականգնել Ֆիլտրերը
            </button>
          </div>
        )}
      </div>

      {/* Rules Explanations card beneath */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-5" id="fc-rules-card">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">💡 Ինչպես է աշխատում ուսումնական համակարգը</h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li><strong>Հայերենից Իսպաներեն</strong>. Քարտի առջևում հայերեն բառն է, կտտացրեք այն՝ իսպաներեն թարգմանությունն ու արտասանությունը բացելու համար:</li>
          <li><strong>Սովորած Բառեր ({learnedIds.length})</strong>. Կտտացրեք էջանիշի կոճակը (<Bookmark className="w-3 h-3 inline text-slate-400" />), որպեսզի բառը նշեք որպես սովորած և առաջադիմեք տոկոսամասերով:</li>
          <li><strong>Աուդիո Ձայնարկում</strong>. Կտտացրեք բացված քարտի էկրանին գտնվող բարձրախոսը (<Volume2 className="w-3 h-3 inline text-indigo-500" />)՝ իսպաներեն արտասանությունը իրական ձայնով լսելու համար:</li>
        </ul>
      </div>
    </div>
  );
}
