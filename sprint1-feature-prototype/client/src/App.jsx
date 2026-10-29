import { useEffect, useMemo, useRef, useState } from 'react';

const TESTS = [
  {
    id: 'aptitude-foundations',
    title: 'Aptitude Foundations',
    category: 'Quantitative aptitude',
    description: 'Practice percentages, ratios, averages and basic numerical reasoning.',
    durationSeconds: 300,
    questionCount: 5,
    available: true,
    questions: [
      { id: 'q1', prompt: 'What is 20% of 250?', options: ['25', '40', '50', '60'], answer: 2 },
      { id: 'q2', prompt: 'The average of 6, 8 and 10 is:', options: ['7', '8', '9', '10'], answer: 1 },
      { id: 'q3', prompt: 'A ratio is 2:3 and the total is 25. What is the smaller part?', options: ['5', '10', '12', '15'], answer: 1 },
      { id: 'q4', prompt: 'A value increases from 80 to 100. What is the percentage increase?', options: ['20%', '25%', '30%', '40%'], answer: 1 },
      { id: 'q5', prompt: 'If 4 notebooks cost ₹60, what do 2 notebooks cost at the same rate?', options: ['₹15', '₹20', '₹30', '₹45'], answer: 2 },
    ],
  },
  {
    id: 'web-basics',
    title: 'Web Technology Basics',
    category: 'Technical preparation',
    description: 'Check foundational knowledge of HTML, JavaScript and web requests.',
    durationSeconds: 420,
    questionCount: 5,
    available: true,
    questions: [
      { id: 'q1', prompt: 'Which HTML element represents the main heading?', options: ['<p>', '<h1>', '<head>', '<title>'], answer: 1 },
      { id: 'q2', prompt: 'Which keyword declares a block-scoped variable that can be reassigned?', options: ['const', 'let', 'static', 'define'], answer: 1 },
      { id: 'q3', prompt: 'Which HTTP method is commonly used to retrieve a resource?', options: ['GET', 'PATCH', 'DELETE', 'TRACE'], answer: 0 },
      { id: 'q4', prompt: 'Which value represents a strict boolean false?', options: ["'false'", '0 only', 'false', 'null only'], answer: 2 },
      { id: 'q5', prompt: 'What does CSS primarily control?', options: ['Database storage', 'Page presentation', 'Network routing', 'Authentication tokens'], answer: 1 },
    ],
  },
  {
    id: 'advanced-mock',
    title: 'Advanced Mock Assessment',
    category: 'Mock tests',
    description: 'This assessment is listed for demonstration but is not currently open.',
    durationSeconds: 600,
    questionCount: 20,
    available: false,
    questions: [],
  },
];

const RESOURCES = [
  { id: 'r1', category: 'Aptitude practice', title: 'Quantitative Aptitude Practice', description: 'Practice arithmetic, percentages, ratios and quantitative problem-solving.', url: 'https://www.geeksforgeeks.org/quantitative-aptitude/', available: true, kind: 'Practice' },
  { id: 'r2', category: 'Aptitude practice', title: 'HackerRank Problem Solving', description: 'Work through programming and problem-solving exercises at different levels.', url: 'https://www.hackerrank.com/domains/algorithms', available: true, kind: 'Practice' },
  { id: 'r3', category: 'Technical preparation', title: 'MDN Web Development', description: 'Review HTML, CSS, JavaScript and web platform concepts.', url: 'https://developer.mozilla.org/en-US/docs/Learn', available: true, kind: 'Learning' },
  { id: 'r4', category: 'Technical preparation', title: 'JavaScript Guide', description: 'Read language fundamentals, functions, objects and asynchronous JavaScript.', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', available: true, kind: 'Learning' },
  { id: 'r5', category: 'Interview guidance', title: 'Interview Preparation Checklist', description: 'A sample checklist for researching an employer, practicing examples and preparing questions.', url: 'https://www.indeed.com/career-advice/interviewing', available: true, kind: 'Guidance' },
  { id: 'r6', category: 'Interview guidance', title: 'Retired Practice Link (demo)', description: 'Example of a resource that has been marked unavailable. This card should not open an external page.', url: '', available: false, kind: 'Unavailable' },
];

const ATTEMPTS_KEY = 'preppath.attempts.v1';
const RESOURCE_CATEGORIES = ['All resources', ...new Set(RESOURCES.map((item) => item.category))];

function readSavedAttempts() {
  try {
    const stored = localStorage.getItem(ATTEMPTS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(Math.max(totalSeconds, 0) / 60).toString().padStart(2, '0');
  const seconds = (Math.max(totalSeconds, 0) % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function App() {
  const [page, setPage] = useState('tests');
  const [showEmptyPreview, setShowEmptyPreview] = useState(false);
  const [resourceCategory, setResourceCategory] = useState('All resources');
  const [attempts, setAttempts] = useState(readSavedAttempts);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [demoTimer, setDemoTimer] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [resourceMessage, setResourceMessage] = useState('');
  const submissionLock = useRef(false);

  const visibleTests = showEmptyPreview ? [] : TESTS;
  const filteredResources = useMemo(
    () => resourceCategory === 'All resources' ? RESOURCES : RESOURCES.filter((item) => item.category === resourceCategory),
    [resourceCategory],
  );
  const answeredCount = activeTest ? activeTest.questions.filter((question) => answers[question.id] !== undefined).length : 0;

  useEffect(() => {
    if (page !== 'attempt' || !activeTest || submission) return undefined;
    if (secondsLeft <= 0) {
      finishAttempt(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
    // Timer state is intentionally tick-based. finishAttempt is stable for the active render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTest, submission, secondsLeft]);

  function startAttempt(test) {
    if (!test.available) return;
    submissionLock.current = false;
    setActiveTest(test);
    setAnswers({});
    setSubmission(null);
    setSecondsLeft(demoTimer ? 30 : test.durationSeconds);
    setPage('attempt');
  }

  function finishAttempt(autoSubmitted = false) {
    if (!activeTest || submission || submissionLock.current) return;
    submissionLock.current = true;
    const correctCount = activeTest.questions.reduce(
      (count, question) => count + (answers[question.id] === question.answer ? 1 : 0),
      0,
    );
    const result = {
      id: `${activeTest.id}-${Date.now()}`,
      testId: activeTest.id,
      testTitle: activeTest.title,
      submittedAt: new Date().toISOString(),
      totalQuestions: activeTest.questions.length,
      answeredQuestions: activeTest.questions.filter((question) => answers[question.id] !== undefined).length,
      correctAnswers: correctCount,
      scorePercent: Math.round((correctCount / activeTest.questions.length) * 100),
      autoSubmitted,
      answers,
    };
    const updated = [result, ...attempts].slice(0, 20);
    try {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
    } catch {
      setResourceMessage('This browser could not save the attempt locally. Keep a note of the result before leaving this page.');
    }
    setAttempts(updated);
    setSubmission(result);
  }

  function openResource(resource) {
    if (!resource.available || !resource.url) {
      setResourceMessage(`“${resource.title}” is marked unavailable and cannot be opened. Choose another resource or contact the portal administrator.`);
      return;
    }
    setResourceMessage('');
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  }

  function resetToTests() {
    setPage('tests');
    setActiveTest(null);
    setAnswers({});
    setSubmission(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); resetToTests(); }} aria-label="PrepPath home">
          <span className="brand-mark">P</span>
          <span><strong>PrepPath</strong><small>Internship & placement prep</small></span>
        </a>
        <div className="topbar-right"><span className="student-dot" /> Student workspace <span className="avatar">ST</span></div>
      </header>

      <div className="prototype-notice"><span className="notice-dot" /> Prototype mode <span>Sample data and browser-local saves only — no server/database connection yet.</span></div>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-label">LEARNING SPACE</div>
          <button className={`nav-item ${page === 'tests' || page === 'attempt' ? 'active' : ''}`} onClick={() => { if (submission) resetToTests(); else if (page !== 'attempt') setPage('tests'); }}><span className="nav-icon">◷</span><span>Aptitude tests</span></button>
          <button className={`nav-item ${page === 'resources' ? 'active' : ''}`} onClick={() => { setPage('resources'); setResourceMessage(''); }}><span className="nav-icon">▤</span><span>Preparation resources</span></button>
          <div className="sidebar-card"><div className="mini-badge">SPRINT 1</div><strong>Build your next step</strong><p>Practice aptitude questions and find useful placement-preparation resources.</p></div>
          <div className="sidebar-footer"><span className="tiny-status" /> Local demo environment</div>
        </aside>

        <main className="main-content">
          {page === 'tests' && (
            <>
              <div className="page-heading">
                <div><div className="eyebrow">YOUR LEARNING DASHBOARD</div><h1>Aptitude tests</h1><p>Build confidence with focused practice and timed assessments.</p></div>
                <div className="heading-icon" aria-hidden="true">◴</div>
              </div>
              <section className="stat-row" aria-label="Test summary">
                <div className="stat-card"><span className="stat-symbol purple">▣</span><div><span className="stat-label">Available tests</span><strong>{TESTS.filter((test) => test.available).length}</strong></div></div>
                <div className="stat-card"><span className="stat-symbol green">✓</span><div><span className="stat-label">Attempts saved here</span><strong>{attempts.length}</strong></div></div>
                <div className="stat-card"><span className="stat-symbol amber">◷</span><div><span className="stat-label">Typical duration</span><strong>5–7 min</strong></div></div>
              </section>

              <div className="section-heading"><div><h2>Choose an assessment</h2><p>Check the description and duration before you begin.</p></div><span className="count-chip">{visibleTests.length} {visibleTests.length === 1 ? 'assessment' : 'assessments'}</span></div>
              <div className="qa-toolbar"><label className="switch-label"><input type="checkbox" checked={showEmptyPreview} onChange={(event) => setShowEmptyPreview(event.target.checked)} /> Preview empty-state (QA)</label><label className="switch-label"><input type="checkbox" checked={demoTimer} onChange={(event) => setDemoTimer(event.target.checked)} /> 30-second timer demo</label></div>

              {visibleTests.length === 0 ? (
                <section className="empty-state"><div className="empty-icon">▧</div><h3>No aptitude tests available</h3><p>There are no assessments available right now. Please check again later.</p><button className="button-secondary" onClick={() => setShowEmptyPreview(false)}>Show available tests</button></section>
              ) : (
                <div className="test-grid">
                  {visibleTests.map((test) => (
                    <article className={`test-card ${!test.available ? 'unavailable-card' : ''}`} key={test.id}>
                      <div className="card-topline"><span className={`category-icon ${test.category === 'Quantitative aptitude' ? 'violet' : test.category === 'Technical preparation' ? 'blue' : 'amber'}`}>{test.category === 'Quantitative aptitude' ? '∑' : test.category === 'Technical preparation' ? '</>' : '✦'}</span><span className={`availability ${test.available ? 'available' : 'unavailable'}`}><span />{test.available ? 'Available' : 'Coming soon'}</span></div>
                      <div className="test-card-body"><span className="category-text">{test.category}</span><h3>{test.title}</h3><p>{test.description}</p><div className="test-meta"><span>◷ {Math.round(test.durationSeconds / 60)} min</span><span>▤ {test.questionCount} questions</span></div></div>
                      <div className="test-card-footer"><span className="preparation-note">{test.available ? 'Ready when you are' : 'Not open for attempts'}</span><button className={test.available ? 'button-primary' : 'button-disabled'} disabled={!test.available} onClick={() => startAttempt(test)}>{test.available ? 'Start test ↗' : 'Unavailable'}</button></div>
                    </article>
                  ))}
                </div>
              )}

              <section className="recent-section"><div className="section-heading"><div><h2>Recent attempts</h2><p>Attempts are stored in this browser for prototype evaluation.</p></div></div>
                {attempts.length === 0 ? <div className="recent-empty">No completed attempts yet. Start an available test to see your result here.</div> : <div className="attempt-list">{attempts.slice(0, 5).map((attempt) => <div className="attempt-row" key={attempt.id}><div className="attempt-check">✓</div><div className="attempt-title"><strong>{attempt.testTitle}</strong><small>{new Date(attempt.submittedAt).toLocaleString()}</small></div><div className="attempt-score"><strong>{attempt.scorePercent}%</strong><small>{attempt.correctAnswers}/{attempt.totalQuestions} correct</small></div><span className={`submission-tag ${attempt.autoSubmitted ? 'auto' : ''}`}>{attempt.autoSubmitted ? 'Auto-submitted' : 'Submitted'}</span></div>)}</div>}
              </section>
            </>
          )}

          {page === 'attempt' && activeTest && (
            <section className="assessment-wrap">
              <button className="text-back" onClick={() => { if (window.confirm('Leave this attempt? Your current answers will not be submitted.')) resetToTests(); }}>← Back to assessments</button>
              {!submission ? (
                <>
                  <div className="assessment-heading"><div><div className="eyebrow">TIMED ASSESSMENT</div><h1>{activeTest.title}</h1><p>Choose one answer for each question. You may change your answers before submitting.</p></div><div className={`timer-box ${secondsLeft <= 30 ? 'timer-warning' : ''}`} aria-live="polite"><span>TIME REMAINING</span><strong>{formatTime(secondsLeft)}</strong></div></div>
                  <div className="progress-line"><span style={{ width: `${(answeredCount / activeTest.questions.length) * 100}%` }} /></div>
                  <div className="question-count">{answeredCount} of {activeTest.questions.length} answered</div>
                  <div className="question-list">{activeTest.questions.map((question, questionIndex) => <article className="question-card" key={question.id}><div className="question-heading"><span className="question-number">{String(questionIndex + 1).padStart(2, '0')}</span><span className="question-text">{question.prompt}</span><span className="question-points">1 point</span></div><fieldset className="answer-options"><legend className="sr-only">Answers for question {questionIndex + 1}</legend>{question.options.map((option, optionIndex) => <label className={`answer-option ${answers[question.id] === optionIndex ? 'selected' : ''}`} key={`${question.id}-${optionIndex}`}><input type="radio" name={`${activeTest.id}-${question.id}`} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span></label>)}</fieldset></article>)}</div>
                  <div className="submit-bar"><span>Review your answers before submission.</span><button className="button-primary" onClick={() => { if (window.confirm('Submit this assessment now? You cannot change answers after submission.')) finishAttempt(false); }}>Submit assessment →</button></div>
                </>
              ) : (
                <div className="result-card"><div className="result-icon">✓</div><div className="eyebrow">ASSESSMENT {submission.autoSubmitted ? 'AUTO-SUBMITTED' : 'SUBMITTED'}</div><h1>Attempt saved</h1><p className="result-subtitle">Your response set has been saved in this browser for prototype evaluation.</p><div className="result-score"><strong>{submission.scorePercent}%</strong><span>{submission.correctAnswers} correct out of {submission.totalQuestions}</span></div><div className="result-details"><div><span>Questions answered</span><strong>{submission.answeredQuestions}/{submission.totalQuestions}</strong></div><div><span>Submission type</span><strong>{submission.autoSubmitted ? 'Timer expired' : 'Manual'}</strong></div><div><span>Submitted at</span><strong>{new Date(submission.submittedAt).toLocaleTimeString()}</strong></div></div><button className="button-primary" onClick={resetToTests}>Return to assessments</button><p className="prototype-warning">Prototype limitation: the attempt is stored locally in this browser, not in a team database or server.</p></div>
              )}
            </section>
          )}

          {page === 'resources' && (
            <>
              <div className="page-heading"><div><div className="eyebrow">KEEP GROWING</div><h1>Preparation resources</h1><p>Find practice materials, technical references and interview guidance in one place.</p></div><div className="heading-icon resource-heading-icon" aria-hidden="true">▤</div></div>
              <div className="resource-filters"><div><strong>Browse by category</strong><p>Choose a topic to narrow the list.</p></div><label className="select-label"><span className="sr-only">Filter resources by category</span><select value={resourceCategory} onChange={(event) => { setResourceCategory(event.target.value); setResourceMessage(''); }}>{RESOURCE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label></div>
              {resourceMessage && <div className="inline-alert" role="status"><span>ⓘ</span><p>{resourceMessage}</p><button aria-label="Dismiss message" onClick={() => setResourceMessage('')}>×</button></div>}
              {filteredResources.length === 0 ? <section className="empty-state"><div className="empty-icon">▧</div><h3>No resources in this category</h3><p>Try another category or return to all resources.</p><button className="button-secondary" onClick={() => setResourceCategory('All resources')}>Show all resources</button></section> : <div className="resource-grid">{filteredResources.map((resource) => <article className={`resource-card ${!resource.available ? 'unavailable-resource' : ''}`} key={resource.id}><div className="resource-card-top"><span className="resource-symbol">{resource.category === 'Aptitude practice' ? '∑' : resource.category === 'Technical preparation' ? '</>' : '✦'}</span><span className={`availability ${resource.available ? 'available' : 'unavailable'}`}><span />{resource.available ? resource.kind : 'Unavailable'}</span></div><div className="resource-copy"><span className="category-text">{resource.category}</span><h3>{resource.title}</h3><p>{resource.description}</p></div><div className="resource-footer"><span className="external-label">{resource.available ? 'External resource ↗' : 'Access disabled'}</span><button className={resource.available ? 'button-secondary' : 'button-disabled'} disabled={!resource.available} onClick={() => openResource(resource)}>{resource.available ? 'Open resource' : 'Unavailable'}</button></div></article>)}</div>}
            </>
          )}

          <footer className="page-footer"><span>PrepPath · Sprint 1 feature prototype</span><span>Sample content · Not connected to production data</span></footer>
        </main>
      </div>
    </div>
  );
}

export default App;
