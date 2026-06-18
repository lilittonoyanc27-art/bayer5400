import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { DICTIONARY, Word } from "./dictionaryData";
import { RefreshCw, Play, Award, Zap, Hourglass } from "lucide-react";

interface CardItem {
  id: string; // unique card id (e.g. 'am-1' or 'es-1')
  wordId: number; // reference to Word list ID
  text: string;
  lang: "am" | "es";
}

export default function WordMatch() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedAm, setSelectedAm] = useState<CardItem | null>(null);
  const [selectedEs, setSelectedEs] = useState<CardItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [wrongCombination, setWrongCombination] = useState<string[]>([]); // holds card IDs of failing attempts for red wiggles
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Load a new round of 5 random word pairs (10 cards)
  const initRound = () => {
    // Pick 5 random unique words
    const count = 5;
    const shuffled = [...DICTIONARY].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, count);

    // Create 5 Armenian cards & 5 Spanish cards
    const amCards: CardItem[] = selectedWords.map((w) => ({
      id: `am-${w.id}`,
      wordId: w.id,
      text: w.am,
      lang: "am",
    }));

    const esCards: CardItem[] = selectedWords.map((w) => ({
      id: `es-${w.id}`,
      wordId: w.id,
      text: w.es,
      lang: "es",
    }));

    // Combine & Shuffle all 10 cards
    const allCards = [...amCards, ...esCards].sort(() => Math.random() - 0.5);

    setCards(allCards);
    setSelectedAm(null);
    setSelectedEs(null);
    setMatchedIds([]);
    setWrongCombination([]);
  };

  const startGame = () => {
    initRound();
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeElapsed(0);
    setGameStarted(true);

    if (timerId) clearInterval(timerId);
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    setTimerId(interval);
  };

  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  // Handle card selection
  const handleCardClick = (card: CardItem) => {
    if (matchedIds.includes(card.wordId)) return; // already completed
    if (wrongCombination.length > 0) return; // wait till mismatch animation finishes

    if (card.lang === "am") {
      // If clicked the same Armenian card again, deselect it
      if (selectedAm?.id === card.id) {
        setSelectedAm(null);
      } else {
        setSelectedAm(card);
      }
    } else {
      // If clicked the same Spanish card again, deselect it
      if (selectedEs?.id === card.id) {
        setSelectedEs(null);
      } else {
        setSelectedEs(card);
      }
    }
  };

  // Perform match validation when both types of cards are selected
  useEffect(() => {
    if (selectedAm && selectedEs) {
      if (selectedAm.wordId === selectedEs.wordId) {
        // MATCH DETECTED!
        const correctId = selectedAm.wordId;
        setMatchedIds((prev) => [...prev, correctId]);
        setScore((prev) => prev + 10);
        setStreak((prev) => {
          const next = prev + 1;
          if (next > bestStreak) setBestStreak(next);
          return next;
        });

        setSelectedAm(null);
        setSelectedEs(null);
      } else {
        // MISMATCH!
        const badAmId = selectedAm.id;
        const badEsId = selectedEs.id;
        setWrongCombination([badAmId, badEsId]);
        setStreak(0);

        setTimeout(() => {
          setWrongCombination([]);
          setSelectedAm(null);
          setSelectedEs(null);
        }, 1000);
      }
    }
  }, [selectedAm, selectedEs, bestStreak]);

  // Handle round completion
  useEffect(() => {
    if (gameStarted && matchedIds.length === 5) {
      // Trigger new round after a brief pause
      setTimeout(() => {
        initRound();
      }, 1500);
    }
  }, [matchedIds, gameStarted]);

  // Format time (MM:SS)
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto" id="match-game-section">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-indigo-500 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6" id="match-header">
          <div>
            <h2 className="text-xl font-black text-indigo-900 tracking-tight flex items-center gap-1.5 animate-bounce">
              🔗 Գտնել Զույգերը (Conecta Parejas)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Միացրեք հայերեն և իսպաներեն թարգմանությունները արագության և ճշգրտության համար:
            </p>
          </div>
          {gameStarted && (
            <button
              onClick={startGame}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold py-1.5 px-3 rounded-xl flex items-center gap-1 transition-all"
              id="match-restart-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Նոր Խաղ
            </button>
          )}
        </div>

        {/* Start Game View */}
        {!gameStarted ? (
          <div className="text-center py-16 px-4 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-100" id="match-intro-view">
            <span className="p-4 bg-indigo-100 text-indigo-600 rounded-full inline-block mb-4">
              <Zap className="w-8 h-8" />
            </span>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Խաղ «Գտնել Զույգերը»</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Էկրանին կհայտնվեն 5 հայերեն և 5 իսպաներեն քարտեր խառը դասավորությամբ: Ձեր խնդիրն է որքան հնարավոր է արագ գտնել բոլոր ճիշտ զույգերը:
            </p>
            <button
              onClick={startGame}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-2xl flex items-center gap-2 mx-auto transition-all shadow-md shadow-indigo-100"
              id="match-start-btn"
            >
              <Play className="w-5 h-5 fill-current" /> Սկսել Խաղալ
            </button>
          </div>
        ) : (
          <div>
            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center" id="match-stats-row">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Միավորներ</span>
                <span className="text-xl font-extrabold text-indigo-600" id="match-score">{score}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex justify-center items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-current" /> Սերիա (Streak)
                </span>
                <span className="text-xl font-extrabold text-amber-500" id="match-streak">{streak}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex justify-center items-center gap-1">
                  <Hourglass className="w-3 h-3 text-slate-400" /> Ժամանակ
                </span>
                <span className="text-xl font-extrabold text-slate-700 font-mono" id="match-timer">{formatTime(timeElapsed)}</span>
              </div>
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6" id="match-cards-grid">
              {cards.map((card) => {
                const isAmSelected = selectedAm?.id === card.id;
                const isEsSelected = selectedEs?.id === card.id;
                const isSelected = isAmSelected || isEsSelected;
                const isMatched = matchedIds.includes(card.wordId);
                const isWrong = wrongCombination.includes(card.id);

                return (
                  <motion.button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    style={{ pointerEvents: isMatched ? "none" : "auto" }}
                    animate={
                      isWrong
                        ? { x: [-5, 5, -5, 5, 0], backgroundColor: "#FCA5A5" } // shake + red wiggle
                        : isMatched
                        ? { scale: 0.95, opacity: 0.5 }
                        : isSelected
                        ? { scale: 1.05 }
                        : {}
                    }
                    transition={{ duration: isWrong ? 0.4 : 0.2 }}
                    className={`h-28 rounded-2xl p-4 border-2 text-center text-xs font-black flex flex-col justify-between transition-all select-none focus:outline-none cursor-pointer duration-100 ${
                      isMatched
                        ? "bg-emerald-50 border-emerald-500 border-b-8 text-emerald-800"
                        : isSelected
                        ? "bg-indigo-600 border-indigo-700 text-white shadow-xl"
                        : isWrong
                        ? "bg-red-550 border-red-500 border-b-8 text-red-950"
                        : card.lang === "am"
                        ? "bg-white border-orange-400 border-b-4 hover:border-orange-500 shadow-md text-indigo-950 hover:-translate-y-0.5"
                        : "bg-white border-blue-400 border-b-4 hover:border-blue-500 shadow-md text-slate-800 hover:-translate-y-0.5"
                    }`}
                    id={`match-card-element-${card.id}`}
                  >
                    <div className="flex justify-between w-full items-center">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                        isSelected 
                          ? "bg-indigo-500 text-white"
                          : card.lang === "am" 
                          ? "bg-orange-50 text-orange-600" 
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {card.lang === "am" ? "🇦🇲 AM" : "🇪🇸 ES"}
                      </span>
                      {isMatched && (
                        <span className="text-[10px] text-emerald-600 font-extrabold">✓</span>
                      )}
                    </div>

                    <p className={`text-center font-sans tracking-tight text-sm overflow-hidden leading-snug w-full line-clamp-2 my-auto py-1 ${
                      isMatched ? "line-through text-emerald-700/80" : isSelected ? "text-white" : "text-indigo-950"
                    }`}>
                      {card.text}
                    </p>

                    <div className="w-full text-left">
                      <span className={`text-[7px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>ID: {card.wordId}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Hint or completion celebration */}
            {matchedIds.length === 5 ? (
              <div className="text-center py-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-center justify-center gap-2" id="round-complete-indicator">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-sm">Ապրե՛ք: Բոլոր զույգերը ճիշտ գտնված են: Հաջորդ փուլը կբացվի ակնթարթորեն:</span>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400" id="match-hint-tip">
                💡 <strong>Հուշում</strong>. Նախ ընտրեք հայերեն բառը (<span className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded text-[9px]">AM</span>), ապա դրա իսպաներեն թարգմանությունը (<span className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-[9px]">ES</span>):
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description and instructions */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-5" id="match-rules-card">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">💡 Խաղի կանոնները</h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li><strong>Ռեակցիայի արագություն</strong>. Գտեք ճիշտ զույգը հնարավորինս քիչ վայրկյաններում:</li>
          <li><strong>Սերիաների բոնուս</strong>. Յուրաքանչյուր հաջորդական ճիշտ համընկնումը մեծացնում է ձեր սերիան (Streak-ը), ինչը զգալիորեն բարելավում է կոնցենտրացիան:</li>
          <li><strong>Փորձերի անսահմանափակություն</strong>. Յուրաքանչյուր 5 զույգ լրացնելուց հետո համակարգը ավտոմատ կերպով կգեներացնի հաջորդ 5 բառերը բառարանից:</li>
        </ul>
      </div>
    </div>
  );
}
