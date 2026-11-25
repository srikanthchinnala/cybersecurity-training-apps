import { useState } from 'react';
import { XP } from '../data/modules.js';

export default function Quiz({ module, progress }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const total = module.quiz.length;

  if (i >= total) {
    return (
      <div className="panel center">
        <h3>Quiz complete</h3>
        <p className="big">{score} / {total}</p>
        <p className="muted">{score === total ? 'Perfect score! 🏆' : 'Review the lessons and try again.'}</p>
        <button onClick={() => { setI(0); setPicked(null); setScore(0); }}>Retry</button>
      </div>
    );
  }

  const q = module.quiz[i];
  const answered = picked !== null;

  function choose(idx) {
    if (answered) return;
    setPicked(idx);
    if (idx === q.answer) {
      setScore((s) => s + 1);
      progress.award(`${module.id}:quiz:${i}`, XP.quizCorrect);
    }
  }

  return (
    <div className="panel">
      <div className="muted">Question {i + 1} of {total}</div>
      <h3>{q.q}</h3>
      <div className="options">
        {q.options.map((opt, idx) => {
          let cls = 'option';
          if (answered && idx === q.answer) cls += ' correct';
          else if (answered && idx === picked) cls += ' wrong';
          return (
            <button key={idx} className={cls} onClick={() => choose(idx)} disabled={answered}>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="row">
          <span className={picked === q.answer ? 'ok' : 'bad'}>
            {picked === q.answer ? `Correct! +${XP.quizCorrect} XP` : 'Not quite.'}
          </span>
          <button onClick={() => { setI(i + 1); setPicked(null); }}>Next →</button>
        </div>
      )}
    </div>
  );
}
