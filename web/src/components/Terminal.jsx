import { useEffect, useRef, useState } from 'react';
import { XP } from '../data/modules.js';

// Simulated terminal: no real commands run. Input is matched against the lab's expected commands.
export default function Terminal({ module, progress }) {
  const { lab } = module;
  const firstOpen = lab.tasks.findIndex((_, i) => !progress.isDone(`${module.id}:lab:${i}`));
  const [step, setStep] = useState(firstOpen === -1 ? lab.tasks.length : firstOpen);
  const [lines, setLines] = useState([{ t: 'sys', v: lab.intro }, { t: 'sys', v: "Type 'help' for commands, 'hint' for the next step." }]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [hIdx, setHIdx] = useState(-1);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  const print = (...entries) => setLines((l) => [...l, ...entries]);

  function run(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    print({ t: 'cmd', v: cmd });
    setHistory((h) => [cmd, ...h]);
    setHIdx(-1);

    if (cmd === 'clear') { setLines([]); return; }
    if (cmd === 'help') {
      print({ t: 'sys', v: 'help · hint · clear · whoami · plus the tools the lab needs (ls, grep, nmap, curl…)' });
      return;
    }
    if (cmd === 'whoami') { print({ t: 'out', v: 'analyst' }); return; }
    if (step >= lab.tasks.length) { print({ t: 'ok', v: 'Lab complete. Pick another module!' }); return; }
    if (cmd === 'hint') { print({ t: 'sys', v: 'Hint: ' + lab.tasks[step].hint }); return; }

    const task = lab.tasks[step];
    if (task.accept.test(cmd)) {
      print(...task.output.map((v) => ({ t: 'out', v })));
      progress.award(`${module.id}:lab:${step}`, XP.labTask);
      print({ t: 'ok', v: `✔ Task ${step + 1}/${lab.tasks.length} complete (+${XP.labTask} XP)` });
      const next = step + 1;
      setStep(next);
      if (next === lab.tasks.length) print({ t: 'ok', v: '🎉 Lab complete! Badge earned.' });
    } else {
      const bin = cmd.split(/\s+/)[0];
      print({ t: 'err', v: `${bin}: that didn't reveal anything useful here. Try 'hint'.` });
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') { run(input); setInput(''); }
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const n = Math.min(hIdx + 1, history.length - 1);
      setHIdx(n); setInput(history[n]);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = hIdx - 1;
      setHIdx(n); setInput(n >= 0 ? history[n] : '');
    }
  }

  return (
    <div className="terminal" onClick={() => document.getElementById('term-input')?.focus()}>
      <div className="term-bar">
        <span className="dot r" /><span className="dot y" /><span className="dot g" />
        <span className="muted">analyst@lab: ~ · task {Math.min(step + 1, lab.tasks.length)}/{lab.tasks.length}</span>
      </div>
      <div className="term-body">
        {lines.map((l, i) => (
          <div key={i} className={'tl ' + l.t}>{l.t === 'cmd' ? <><span className="prompt">$</span> {l.v}</> : l.v}</div>
        ))}
        <div className="tl">
          <span className="prompt">$</span>{' '}
          <input
            id="term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            spellCheck="false"
            aria-label="Terminal input"
            autoFocus
          />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}
