import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DICTIONARY, Word } from "./dictionaryData";
import { Volume2, RefreshCw, Sparkles, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";

interface LetterBadge {
  id: string;
  char: string;
  used: boolean;
}

export default function LetterScramble() {
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [scrambledLetters, setScrambledLetters] = useState<LetterBadge[]>([]);
  const [guessedChars, setGuessedChars] = useState<{ id: string; char: string }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  // Filter suitable single-word translations from the dictionary
  const getSingleWords = () => {
    return DICTIONARY.filter(
      (w) =>
        w.es.length > 2 &&
        w.es.length < 12 &&
        !w.es.includes(" ") &&
        !w.es.includes("/") &&
        !w.es.includes("+") &&
        !w.es.includes("?") &&
        !w.es.includes("¿")
    );
  };

  const loadNewWord = () => {
    const wordList = getSingleWords();
    if (wordList.length === 0) return;

    // Pick 1 random word
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    setTargetWord(word);
    setGuessedChars([]);
    setIsSuccess(false);
    setHintUsed(false);

    // Prepare chars of Spanish translation
    const cleanEs = word.es.toLowerCase();
    const letters = cleanEs.split("");

    // Distractor letters (add standard spanish characters like á, é, í, ó, ú, ñ or basic letters if short)
    const distractors = ["a", "e", "o", "s", "n", "r", "i", "l", "t", "d"];
    if (letters.length < 6) {
      // Add 2 random distractor letters
      for (let i = 0; i < 2; i++) {
        const d = distractors[Math.floor(Math.random() * distractors.length)];
        letters.push(d);
      }
    }

    // Convert to LetterBadges & Shuffle
    const badges: LetterBadge[] = letters.map((char, index) => ({
      id: `char-${index}-${char}`,
      char,
      used: false,
    }));

    // Shuffle
    const shuffled = badges.sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
  };

  useEffect(() => {
    loadNewWord();
  }, []);

  // Handle Badge Click
  const handleBadgeClick = (badge: LetterBadge) => {
    if (badge.used || isSuccess) return;

    // Mark badge as used
    setScrambledLetters((prev) =>
      prev.map((b) => (b.id === badge.id ? { ...b, used: true } : b))
    );

    // Add to guessed string
    const nextGuesses = [...guessedChars, { id: badge.id, char: badge.char }];
    setGuessedChars(nextGuesses);

    // Automatically check match
    if (targetWord) {
      const currentString = nextGuesses.map((g) => g.char).join("");
      const cleanTarget = targetWord.es.toLowerCase();
      if (currentString === cleanTarget) {
        setIsSuccess(true);
        setScore((prev) => prev + 15);
        speakSpanish(targetWord.es);
      }
    }
  };

  // Remove last letter from guess
  const handleRemoveLast = () => {
    if (guessedChars.length === 0 || isSuccess) return;

    const last = guessedChars[guessedChars.length - 1];
    setGuessedChars((prev) => prev.slice(0, -1));

    // Mark badge as unused
    setScrambledLetters((prev) =>
      prev.map((b) => (b.id === last.id ? { ...b, used: false } : b))
    );
  };

  // Reset guessing board
  const handleReset = () => {
    setGuessedChars([]);
    setIsSuccess(false);
    setScrambledLetters((prev) => prev.map((b) => ({ ...b, used: false })));
  };

  // Give a hint (pre-fill first character or reveal)
  const handleUseHint = () => {
    if (!targetWord || hintUsed || isSuccess) return;
    setHintUsed(true);

    const firstChar = targetWord.es.charAt(0).toLowerCase();

    // Find first badge with this character that is not yet used
    const matchingBadge = scrambledLetters.find((b) => b.char === firstChar && !b.used);
    if (matchingBadge) {
      handleBadgeClick(matchingBadge);
    }
  };

  const speakSpanish = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" id="scramble-game-section">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/80 mb-6 font-sans">
        
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6" id="scramble-header">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
              🧩 Կառուցիր Բառը (Palabra Desordenada)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Հավաքեք թիրախային իսպաներեն բառը առաջարկվող տառերի միջոցով:
            </p>
          </div>
          <div className="bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <span className="text-xs font-bold text-amber-700">Բարձրագույն միավորներ՝ {score}</span>
          </div>
        </div>

        {targetWord ? (
          <div>
            {/* Clue/Hint Panel */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-6 text-center mb-6" id="scramble-target-box">
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase">
                🇦🇲 Հայերեն հուշում
              </span>
              <h3 className="text-2xl font-bold text-slate-800 py-3" id="scramble-target-word">
                {targetWord.am}
              </h3>
              <p className="text-xs text-indigo-500 font-semibold" id="scramble-target-cat">
                📂 Կատեգորիա՝ {targetWord.category}
              </p>
            </div>

            {/* Answer Display Line */}
            <div className="mb-6 flex flex-col items-center">
              <span className="text-xs text-slate-400 mb-2">Ձեր թարգմանության նախագիծը</span>
              
              <div className="flex flex-wrap justify-center gap-2 h-14 items-center bg-slate-50/50 rounded-2xl w-full border border-slate-200/30 px-3 py-2">
                {guessedChars.map((item, idx) => (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={`guess-${item.id}-${idx}`}
                    className="w-10 h-10 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center text-lg shadow-sm"
                  >
                    {item.char.toUpperCase()}
                  </motion.span>
                ))}
                
                {guessedChars.length === 0 && (
                  <span className="text-xs text-slate-400 italic">Սեղմեք տառերի վրա՝ բառը կազմելու համար</span>
                )}
              </div>
            </div>

            {/* Scramble Clickable Letters list */}
            {!isSuccess && (
              <div className="flex flex-wrap justify-center gap-2 mb-6" id="scramble-buttons-group">
                {scrambledLetters.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge)}
                    disabled={badge.used}
                    className={`w-12 h-12 rounded-xl text-lg font-bold border-2 flex items-center justify-center transition-all ${
                      badge.used
                        ? "bg-slate-100 border-slate-200 text-slate-300 pointer-events-none"
                        : "bg-white border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-slate-50 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                    }`}
                  >
                    {badge.char.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons toolbar */}
            {!isSuccess && (
              <div className="flex justify-center gap-2 mb-6" id="scramble-tools">
                <button
                  onClick={handleRemoveLast}
                  disabled={guessedChars.length === 0}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-4 py-2 rounded-xl disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  id="scramble-backspace-btn"
                >
                  ↩ Ջնջել վերջինը
                </button>
                <button
                  onClick={handleReset}
                  disabled={guessedChars.length === 0}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-4 py-2 rounded-xl disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  id="scramble-clear-btn"
                >
                  🔄 Մաքրել
                </button>
                <button
                  onClick={handleUseHint}
                  disabled={hintUsed}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-xs px-4 py-2 rounded-xl disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  id="scramble-hint-btn"
                >
                  💡 Տալ հուշում {hintUsed && "(օգտագործված է)"}
                </button>
              </div>
            )}

            {/* Success Certificate Overlay banner */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center shadow-sm mb-6"
                  id="scramble-success-badge"
                >
                  <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-emerald-800">Շատ հիանալի՛ է:</h4>
                  <p className="text-xs text-slate-600 mt-1 mb-4">
                    Ճիշտ բառը հավաքված է՝ <strong className="text-indigo-800 text-sm font-sans">{targetWord.es.toUpperCase()}</strong>
                  </p>

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => speakSpanish(targetWord.es)}
                      className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      id="scramble-listen-sound"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-600" /> Լսել արտասանությունը
                    </button>
                    <button
                      onClick={loadNewWord}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                      id="scramble-next-btn"
                    >
                      Հաջորդ բառը <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clue/Hint for wrong attempts */}
            {guessedChars.length >= targetWord.es.length && !isSuccess && (
              <div className="bg-red-50 text-red-800 rounded-2xl border border-red-100 p-4 text-center text-xs flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Սխալ տառերի դասավորում: Փորձեք <strong>«Ջնջել վերջինը»</strong> կամ <strong>«Մաքրել»</strong> տախտակը:</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">Բեռնում...</div>
        )}
      </div>

      {/* Scramble Instructions and explanations */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-5" id="scramble-rules-card">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">💡 Ինչպես հավաքել բառերը</h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li><strong>Ինտերակտիվ տախտակ</strong>. Կտտացրեք նախատեսված տառերի վրա՝ ստեղծելով ճշգրիտ թարգմանչական տառաշղթան:</li>
          <li><strong>Հավելյալ տառեր</strong>. Կարող են ներկայացված լինել 2-3 այլընտրանքային «խաբուսիկ» տառեր՝ խաղը ավելի հետաքրքիր դարձնելու համար:</li>
          <li><strong>Հուշում (+15 միավոր)</strong>. Եթե դժվարանում եք, կտտացրեք <strong>«Տալ հուշում»</strong> կոճակը, որպեսզի ավտոմատ լրացվի բառի առաջին տառը:</li>
        </ul>
      </div>
    </div>
  );
}
