import { useState } from 'react';
import { modules, XP } from './data/modules.js';
import { useProgress, levelFor } from './useProgress.js';
import Quiz from './components/Quiz.jsx';
import Terminal from './components/Terminal.jsx';

function moduleStats(m, isDone) {
  const keys = [
    ...m.lessons.map((_, i) => `${m.id}:lesson:${i}`),
    ...m.quiz.map((_, i) => `${m.id}:quiz:${i}`),
    ...m.lab.tasks.map((_, i) => `${m.id}:lab:${i}`),
  ];
  const done = keys.filter(isDone).length;
  return { done, total: keys.length, pct: Math.round((done / keys.length) * 100) };
}

export default function App() {
  const progress = useProgress();
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState('learn');
  const { level, rank, into } = levelFor(progress.xp);
  const active = modules.find((m) => m.id === activeId);
  const badges = modules.filter((m) => m.lab.tasks.every((_, i) => progress.isDone(`${m.id}:lab:${i}`)));

  return (
    <div className="app">
      <header className="top">
        <button className="brand" onClick={() => setActiveId(null)}>🛡️ CyberTrainer</button>
        <div className="xp">
          <span className="rank">Lv {level} · {rank}</span>
          <div className="bar" title={`${into}/100 XP to next level`}><div style={{ width: `${into}%` }} /></div>
          <span className="muted">{progress.xp} XP · 🔥 {progress.streak}d</span>
        </div>
      </header>

      {!active && (
        <main>
          <section className="hero">
            <h1>Learn security by doing.</h1>
            <p className="muted">Short lessons, quick quizzes and hands-on terminal labs. Earn XP, level up and collect badges.</p>
          </section>

          <section className="grid">
            {modules.map((m) => {
              const s = moduleStats(m, progress.isDone);
              return (
                <button key={m.id} className="module" onClick={() => { setActiveId(m.id); setTab('learn'); }}>
                  <div className="icon">{m.icon}</div>
                  <h2>{m.title}</h2>
                  <div className="muted">{m.level} · {m.lessons.length} lessons · {m.quiz.length} questions · {m.lab.tasks.length}-step lab</div>
                  <div className="bar"><div style={{ width: `${s.pct}%` }} /></div>
                  <div className="muted">{s.pct}% complete</div>
                </button>
              );
            })}
          </section>

          <section className="panel">
            <h3>Badges</h3>
            {badges.length === 0 ? <p className="muted">Finish a lab to earn your first badge.</p> : (
              <div className="badges">{badges.map((b) => <span key={b.id} className="badge">{b.icon} {b.title}</span>)}</div>
            )}
            <button className="link" onClick={() => { if (confirm('Reset all progress?')) progress.reset(); }}>Reset progress</button>
          </section>
        </main>
      )}

      {active && (
        <main>
          <button className="link" onClick={() => setActiveId(null)}>← All modules</button>
          <h1>{active.icon} {active.title}</h1>
          <nav className="tabs">
            {['learn', 'quiz', 'lab'].map((t) => (
              <button key={t} className={tab === t ? 'tab on' : 'tab'} onClick={() => setTab(t)}>
                {t === 'learn' ? '📖 Learn' : t === 'quiz' ? '❓ Quiz' : '💻 Terminal lab'}
              </button>
            ))}
          </nav>

          {tab === 'learn' && active.lessons.map((l, i) => {
            const key = `${active.id}:lesson:${i}`;
            const done = progress.isDone(key);
            return (
              <article key={key} className="panel lesson">
                <h3>{i + 1}. {l.title}</h3>
                <p>{l.body}</p>
                <button disabled={done} onClick={() => progress.award(key, XP.lesson)}>
                  {done ? '✔ Completed' : `Mark complete (+${XP.lesson} XP)`}
                </button>
              </article>
            );
          })}

          {tab === 'quiz' && <Quiz key={active.id} module={active} progress={progress} />}
          {tab === 'lab' && <Terminal key={active.id} module={active} progress={progress} />}
        </main>
      )}

      <footer className="muted">Labs are simulated: no real commands run. Practise only on systems you are authorised to test.</footer>
    </div>
  );
}
