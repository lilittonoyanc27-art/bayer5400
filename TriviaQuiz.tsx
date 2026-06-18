import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DICTIONARY, Word } from "./dictionaryData";
import { Trophy, RefreshCw, Volume2, HelpCircle, CheckCircle, XCircle, ArrowRight } from "lucide-react";

type QuizMode = "am-to-es" | "es-to-am";

interface Question {
  correctWord: Word;
  options: string[];
  correctOption: string;
}

export default function TriviaQuiz() {
  const [mode, setMode] = useState<QuizMode>("am-to-es");
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10); // Standard quiz round of 10 words
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  // Generate a quiz question
  const generateQuestion = (currentMode: QuizMode) => {
    if (DICTIONARY.length < 4) return;

    // Pick 1 random correct word
    const correctWord = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];

    // Pick 3 random incorrect option words
    const wrongWords: Word[] = [];
    while (wrongWords.length < 3) {
      const idx = Math.floor(Math.random() * DICTIONARY.length);
      const w = DICTIONARY[idx];
      if (w.id !== correctWord.id && !wrongWords.some((item) => item.id === w.id)) {
        wrongWords.push(w);
      }
    }

    // Determine target translations
    const correctOption = currentMode === "am-to-es" ? correctWord.es : correctWord.am;
    const options = wrongWords.map((w) => (currentMode === "am-to-es" ? w.es : w.am));
    options.push(correctOption);

    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    setQuestion({
      correctWord,
      options: shuffledOptions,
      correctOption,
    });
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  // Start the quiz
  const startQuiz = () => {
    setScore(0);
    setWrongCount(0);
    setCurrentRound(1);
    setQuizFinished(false);
    generateQuestion(mode);
  };

  useEffect(() => {
    startQuiz();
  }, [mode]);

  // Handle option select
  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option === question?.correctOption) {
      setScore((prev) => prev + 10);
      // Play brief pronunciation if in Armenian-to-Spanish mode
      if (mode === "am-to-es" && question) {
        speakSpanish(question.correctWord.es);
      }
    } else {
      setWrongCount((prev) => prev + 1);
    }
  };

  // Proceed to next round or finish
  const handleNext = () => {
    if (currentRound < totalRounds) {
      setCurrentRound((prev) => prev + 1);
      generateQuestion(mode);
    } else {
      setQuizFinished(true);
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
    <div className="w-full max-w-2xl mx-auto" id="trivia-quiz-section">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/80 mb-6 font-sans">
        
        {/* Header Grid */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6" id="trivia-header">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
              🎓 Թեստ-Վիկտորինա (Trivia Intelectual)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ընտրեք ճիշտ թարգմանությունը համակարգի կողմից առաջարկված չորս տարբերակներից:
            </p>
          </div>
          
          {/* Mode Switcher */}
          {!quizFinished && (
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40" id="quiz-mode-switcher">
              <button
                onClick={() => setMode("am-to-es")}
                className={`text-[10px] md:text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                  mode === "am-to-es" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
                id="mode-am-to-es-btn"
              >
                🇦🇲 ➔ 🇪🇸
              </button>
              <button
                onClick={() => setMode("es-to-am")}
                className={`text-[10px] md:text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                  mode === "es-to-am" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
                id="mode-es-to-am-btn"
              >
                🇪🇸 ➔ 🇦🇲
              </button>
            </div>
          )}
        </div>

        {/* Finished State Screen */}
        {quizFinished ? (
          <div className="text-center py-12 px-4" id="trivia-ended-view">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6 border border-amber-200"
            >
              <Trophy className="w-10 h-10 stroke-[2]" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Վիկտորինայի Ավարտ</h3>
            <p className="text-sm text-slate-500 mb-6">Դուք բարեհաջող ավարտեցիք 10 բառանոց վիկտորինան:</p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 max-w-sm mx-auto mb-8 grid grid-cols-2 gap-4">
              <div className="text-center border-r border-slate-200">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Միավորներ</span>
                <span className="text-3xl font-extrabold text-indigo-600" id="final-score">{score}</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Ճիշտ պատասխաններ</span>
                <span className="text-3xl font-extrabold text-emerald-600" id="final-correct">{score / 10} / 10</span>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-2xl flex items-center gap-2 mx-auto transition-all shadow-md shadow-indigo-100 cursor-pointer"
              id="quiz-retry-btn"
            >
              <RefreshCw className="w-5 h-5" /> Խաղալ նորից
            </button>
          </div>
        ) : question ? (
          <div>
            {/* Quest Progress bar */}
            <div className="mb-6" id="quiz-progress-section">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Հարց {currentRound} -ը {totalRounds} -ից</span>
                <span className="font-semibold text-indigo-600">Հասարակ միավորներ` {score}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${(currentRound / totalRounds) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card Box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-8 text-center mb-6 relative overflow-hidden" id="quiz-target-card">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {mode === "am-to-es" ? "🇦🇲 Ինչպե՞ս կլինի իսպաներենով" : "🇪🇸 Ինչպե՞ս կլինի հայերենով"}
              </div>

              <h3 className="text-3xl font-bold text-slate-800 tracking-tight py-4" id="quiz-question-word">
                {mode === "am-to-es" ? question.correctWord.am : question.correctWord.es}
              </h3>

              <div className="text-xs text-indigo-600 font-semibold bg-indigo-50 inline-block px-3 py-1 rounded-full">
                📂 Կատեգորիա՝ {question.correctWord.category}
              </div>
            </div>

            {/* Answers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6" id="quiz-answers-grid">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === question.correctOption;
                const showSuccess = isAnswered && isCorrect;
                const showFailure = isAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={`${option}-${idx}`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border-2 text-left text-sm font-semibold flex items-center justify-between transition-all select-none focus:outline-none ${
                      showSuccess
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                        : showFailure
                        ? "bg-red-50 border-red-400 text-red-800"
                        : isAnswered
                        ? "bg-slate-50/50 border-slate-100 text-slate-400"
                        : "bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-700 cursor-pointer"
                    }`}
                    id={`quiz-option-${idx}`}
                  >
                    <span>{option}</span>
                    {showSuccess && (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    {showFailure && (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedbacks Block */}
            <AnimatePresence mode="wait">
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-2xl p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    selectedAnswer === question.correctOption
                      ? "bg-emerald-50/30 border-emerald-200 text-emerald-900"
                      : "bg-red-50/30 border-red-200 text-red-900"
                  }`}
                  id="quiz-feedback-banner"
                >
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      {selectedAnswer === question.correctOption ? (
                        <>🎉 Ճիշտ պատասխան!</>
                      ) : (
                        <>❌ Սխալ պատասխան</>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedAnswer === question.correctOption
                        ? `Հրաշալի է: Բառը ճիշտ թարգմանվեց իսպաներեն «${question.correctWord.es}»:`
                        : `Սխալվել եք, ճիշտ թարգմանությունն է՝ «${question.correctOption}»:`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {mode === "am-to-es" && (
                      <button
                        onClick={() => speakSpanish(question.correctWord.es)}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 p-2 rounded-xl transition-colors shadow-sm cursor-pointer"
                        title="Արտասանել"
                        id="quiz-listen-pronounce"
                      >
                        <Volume2 className="w-4 h-4 text-indigo-600" />
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                      id="quiz-next-btn"
                    >
                      {currentRound === totalRounds ? "Ավարտել վիկտորինան" : "Հաջորդ հարցը"}{" "}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">Բեռնում...</div>
        )}
      </div>

      {/* Stats Description Card */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-5" id="trivia-rules-card">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2">💡 Ինչպես հաղթել Վիկտորինայում</h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li><strong>10-Հարցից Բաղկացած Փուլ</strong>. Յուրաքանչյուր ճիշտ պատասխան տալիս է <strong>10 միավոր</strong>:</li>
          <li><strong>Լսողական հիշողություն</strong>. Ճիշտ պատասխան ընտրելիս համակարգը ավտոմատ կարտասանի իսպաներեն բառը ձեր իրական կրթության համար:</li>
          <li><strong>Երկկողմանի ուսուցում</strong>. Կարող եք ցանկացած պահի փոխել ուղղությունը (🇦🇲 ➔ 🇪🇸 / 🇪🇸 ➔ 🇦🇲) վերևի անջատիչի միջոցով:</li>
        </ul>
      </div>
    </div>
  );
}
