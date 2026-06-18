import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { DICTIONARY, Word } from "./dictionaryData";
import { RefreshCw, Play, Award, Zap, HelpCircle } from "lucide-react";

interface MemoryCard {
  id: string; // unique grid ID
  wordId: number; // dictionary Word reference ID
  text: string;
  lang: "am" | "es";
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGrid() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem("armesp_memo_best");
    return saved ? parseInt(saved) : 999;
  });

  const initGame = () => {
    // Pick 4 random words
    const count = 4;
    const shuffled = [...DICTIONARY].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, count);

    // Create Armenian Cards (4) & Spanish Cards (4)
    const amCards: MemoryCard[] = selectedWords.map((w) => ({
      id: `am-${w.id}`,
      wordId: w.id,
      text: w.am,
      lang: "am",
      isFlipped: false,
      isMatched: false,
    }));

    const esCards: MemoryCard[] = selectedWords.map((w) => ({
      id: `es-${w.id}`,
      wordId: w.id,
      text: w.es,
      lang: "es",
      isFlipped: false,
      isMatched: false,
    }));

    // Combine & Shuffle all 8 cards
    const gridCards = [...amCards, ...esCards].sort(() => Math.random() - 0.5);
    setCards(gridCards);
    setSelectedIndices([]);
    setMoves(0);
    setPairsFound(0);
    setGameStarted(true);
  };

  const handleCardClick = (idx: number) => {
    // If already flipped, matched, or 2 cards are currently selected, ignore
    if (cards[idx].isFlipped || cards[idx].isMatched || selectedIndices.length >= 2) return;

    // Flip the clicked card
    const updatedCards = [...cards];
    updatedCards[idx].isFlipped = true;
    setCards(updatedCards);

    const nextSelected = [...selectedIndices, idx];
    setSelectedIndices(nextSelected);

    // If 2 cards are now open, check for match
    if (nextSelected.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextSelected;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.wordId === secondCard.wordId && firstCard.lang !== secondCard.lang) {
        // MATCH!
        setTimeout(() => {
          setCards((prev) => {
            const next = [...prev];
            next[firstIdx].isMatched = true;
            next[secondIdx].isMatched = true;
            return next;
          });
          setPairsFound((p) => p + 1);
          setSelectedIndices([]);
        }, 500);
      } else {
        // MISMATCH! Flip back after pause
        setTimeout(() => {
          setCards((prev) => {
            const next = [...prev];
            next[firstIdx].isFlipped = false;
            next[secondIdx].isFlipped = false;
            return next;
          });
          setSelectedIndices([]);
        }, 1200);
      }
    }
  };

  useEffect(() => {
    if (gameStarted && pairsFound === 4) {
      if (moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem("armesp_memo_best", moves.toString());
      }
    }
  }, [pairsFound, moves, gameStarted, bestScore]);

  return (
    <div className="w-full max-w-2xl mx-auto" id="memo-game-section">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/80 mb-6">
        
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6" id="memo-header">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
              🧠 Հիշողության Ցանց (Cuadrícula de Memoria)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Գտեք համապատասխան քարտերը՝ շրջելով դրանք զույգերով:
            </p>
          </div>
          {gameStarted && (
            <button
              onClick={initGame}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              id="memo-restart-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Նոր Խաղ
            </button>
          )}
        </div>

        {/* Start Intro View */}
        {!gameStarted ? (
          <div className="text-center py-16 px-4 bg-amber-50/40 rounded-2xl border-2 border-dashed border-amber-100" id="memo-intro-view">
            <span className="p-4 bg-amber-100 text-amber-600 rounded-full inline-block mb-4">
              <Zap className="w-8 h-8" />
            </span>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Հիշողության Մարզման Խաղ</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Պարզ զույգերի հիշողության խաղ: Էկրանին կցուցադրվեն 8 փակ քարտեր (4 հայերեն և 4 իսպաներեն թարգմանություններ): Փորձեք գտնել բոլոր զույգերը հնարավորինս քիչ քայլերով:
            </p>
            <button
              onClick={initGame}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-2xl flex items-center gap-2 mx-auto transition-all shadow-md shadow-indigo-100 cursor-pointer"
              id="memo-start-btn"
            >
              <Play className="w-5 h-5 fill-current" /> Սկսել Խաղալ
            </button>
          </div>
        ) : (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-center" id="memo-stats-row">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Կատարված փորձեր</span>
                <span className="text-lg font-extrabold text-indigo-600" id="memo-moves">{moves} քայլ</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Լավագույն արդյունք</span>
                <span className="text-lg font-extrabold text-amber-600" id="memo-best-moves">
                  {bestScore === 999 ? "—" : `${bestScore} քայլ`}
                </span>
              </div>
            </div>

            {/* Grid Array */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" id="memo-cards-grid">
              {cards.map((card, idx) => {
                const isOpen = card.isFlipped || card.isMatched;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className="relative h-28 cursor-pointer select-none perspective-1000"
                    id={`memo-card-${card.id}`}
                  >
                    <motion.div
                      className="w-full h-full relative"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      {/* Front Card Face (Closed / Hidden) */}
                      <div
                        className="absolute inset-0 w-full h-full bg-slate-50 border-2 border-slate-200/80 rounded-2xl flex flex-col justify-center items-center shadow-sm"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <HelpCircle className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-1">ArmEsp</span>
                      </div>

                      {/* Back Card Face (Open / Text shown) */}
                      <div
                        className={`absolute inset-0 w-full h-full border-2 rounded-2xl p-4 flex flex-col justify-between items-center text-center ${
                          card.isMatched
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : card.lang === "am"
                            ? "bg-indigo-50/40 border-indigo-200 text-indigo-900"
                            : "bg-amber-50/50 border-amber-200 text-amber-950"
                        }`}
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      >
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          card.lang === "am" ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {card.lang === "am" ? "🇦🇲 AM" : "🇪🇸 ES"}
                        </span>
                        
                        <p className={`text-xs font-bold leading-tight font-sans my-auto py-1 ${
                          card.isMatched ? "line-through text-emerald-700/70" : ""
                        }`}>
                          {card.text}
                        </p>

                        <span className="text-[7px] text-slate-400">ID: {card.wordId}</span>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Victory Badge */}
            {pairsFound === 4 && (
              <div className="text-center py-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-center justify-center gap-2 mb-2" id="memo-victory-shield">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-sm">Շնորհավորո՛ւմ ենք: Հաջողությամբ գտաք բոլոր 4 զույգերը `{moves}` քայլով:</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Memo Rules */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-5" id="memo-rules-card">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">💡 Ինչպես մարզել ուղեղը</h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li><strong>Բառապաշարի տեսողականացում</strong>. Մեկ հայերեն և մեկ իսպաներեն թարգմանությունները միասին բացելը գրանցվում է որպես համընկնում (Զույգ):</li>
          <li><strong>Հիշողություն</strong>. Եթե քարտերը չեն համընկնում, դրանք ավտոմատ հետ կշրջվեն: Մտապահեք դրանց դիրքերը հաջորդ քայլերի համար:</li>
          <li><strong>Լավագույն ռեկորդ</strong>. Նվազագույն քայլերով լուծումը կամրագրվի որպես ձեր լավագույն ռեկորդ:</li>
        </ul>
      </div>
    </div>
  );
}
