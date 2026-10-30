import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function ErrorMessage({ children }) {
  return children ? <p className="banner error" role="alert">{children}</p> : null;
}

export function AptitudeTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    let active = true;
    api("/api/preparation/tests")
      .then((data) => { if (active) setTests(data.tests || []); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function startTest(test) {
    setError("");
    setStartingId(test.id);
    try {
      const data = await api(`/api/preparation/tests/${test.id}/attempts`, { method: "POST" });
      navigate(`/preparation/attempt/${data.attempt.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setStartingId(null);
    }
  }

  return (
    <section className="stack preparation-page">
      <div className="row page-title-row">
        <div>
          <p className="meta">PLACEMENT PREPARATION</p>
          <h1>Aptitude tests</h1>
          <p className="lede">Choose an assessment, check its duration and submit before the timer expires.</p>
        </div>
        <Link className="button quiet" to="/preparation/results">View previous results</Link>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <p>Loading assessments…</p> : tests.length === 0 ? (
        <section className="panel empty-panel"><h2>No aptitude tests available</h2><p className="lede">There are no assessments in the catalogue yet. Please check again later.</p></section>
      ) : (
        <div className="grid preparation-grid">
          {tests.map((test) => (
            <article className="card preparation-card" key={test.id}>
              <div className="row"><span className="pill">{test.category}</span><span className={`pill ${test.is_available ? "available" : "closed"}`}>{test.is_available ? "Available" : "Unavailable"}</span></div>
              <h2>{test.title}</h2>
              <p className="lede">{test.description}</p>
              <div className="meta"><span>{Math.ceil(test.duration_seconds / 60)} min</span><span>{test.question_count} questions</span></div>
              <button disabled={!test.is_available || startingId !== null} onClick={() => startTest(test)}>
                {startingId === test.id ? "Opening…" : test.is_available ? "Start assessment" : "Not available"}
              </button>
            </article>
          ))}
        </div>
      )}
      <p className="meta">Your answers and results are saved to your student account.</p>
    </section>
  );
}

export function AssessmentAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitLock = useRef(false);

  useEffect(() => {
    let active = true;
    api(`/api/preparation/attempts/${attemptId}`)
      .then((data) => {
        if (!active) return;
        if (data.attempt.status === "submitted") {
          navigate(`/preparation/results/${attemptId}`, { replace: true });
          return;
        }
        setAttempt(data.attempt);
        setAnswers(data.attempt.answers || {});
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attemptId, navigate]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return undefined;
    const serverOffsetMs = Date.now() - new Date(attempt.server_now).getTime();
    const update = () => {
      const estimatedServerNow = Date.now() - serverOffsetMs;
      setSecondsLeft(Math.max(0, Math.ceil((new Date(attempt.expires_at).getTime() - estimatedServerNow) / 1000)));
    };
    update();
    const timer = window.setInterval(update, 500);
    return () => window.clearInterval(timer);
  }, [attempt]);

  async function submit(autoSubmitted) {
    if (submitLock.current || submitting) return;
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      await api(`/api/preparation/attempts/${attemptId}/submit`, { method: "POST", body: { autoSubmitted } });
      navigate(`/preparation/results/${attemptId}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (attempt && secondsLeft === 0 && !loading) submit(true);
    // submit is guarded by submitLock to prevent duplicate expiry submissions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, attempt, loading]);

  async function saveAnswer(questionId, optionIndex) {
    if (saving || submitting || secondsLeft === 0) return;
    const next = { ...answers, [String(questionId)]: optionIndex };
    setAnswers(next);
    setSaving(true);
    setError("");
    try {
      await api(`/api/preparation/attempts/${attemptId}/answers`, {
        method: "PUT",
        body: { answers: next },
      });
    } catch (requestError) {
      setError(requestError.message);
      // Reload the server-saved draft so the display never claims an unsaved answer.
      try {
        const data = await api(`/api/preparation/attempts/${attemptId}`);
        setAnswers(data.attempt.answers || {});
      } catch {
        // Keep the original request error visible.
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading your assessment…</p>;
  if (!attempt) return <section className="stack"><ErrorMessage>{error || "This assessment attempt could not be opened."}</ErrorMessage><Link to="/preparation/tests">Back to assessments</Link></section>;

  const answeredCount = Object.keys(answers).length;
  return (
    <section className="stack preparation-page">
      <div className="row page-title-row">
        <div><p className="meta">TIMED ASSESSMENT</p><h1>{attempt.test_title}</h1><p className="lede">Your answers are saved as you select them. You can change them until submission.</p></div>
        <div className={`timer-panel ${secondsLeft <= 30 ? "timer-warning" : ""}`} aria-live="polite"><span>TIME LEFT</span><strong>{secondsLeft === null ? "—" : formatTime(secondsLeft)}</strong></div>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="row assessment-status"><span>{answeredCount} of {attempt.questions.length} answered</span><span>{saving ? "Saving answer…" : "Answers saved"}</span></div>
      <div className="progress-track"><span style={{ width: `${attempt.questions.length ? (answeredCount / attempt.questions.length) * 100 : 0}%` }} /></div>
      <div className="grid stack">
        {attempt.questions.map((question, index) => (
          <article className="panel question-panel" key={question.id}>
            <div className="row"><strong>Question {index + 1}</strong><span className="meta">{question.points} point{question.points === 1 ? "" : "s"}</span></div>
            <h2>{question.prompt}</h2>
            <fieldset className="answer-options">
              <legend className="sr-only">Select an answer for question {index + 1}</legend>
              {question.options.map((option, optionIndex) => (
                <label className="answer-choice" key={`${question.id}-${optionIndex}`}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[String(question.id)] === optionIndex}
                    disabled={saving || submitting || secondsLeft === 0}
                    onChange={() => saveAnswer(question.id, optionIndex)}
                  />
                  <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                </label>
              ))}
            </fieldset>
          </article>
        ))}
      </div>
      <div className="actions">
        <button disabled={saving || submitting} onClick={() => {
          if (window.confirm("Submit this assessment now? You cannot change your answers after submission.")) submit(false);
        }}>{submitting ? "Submitting…" : "Submit assessment"}</button>
        <Link className="button quiet" to="/preparation/tests" onClick={(event) => {
          if (!window.confirm("Leave this assessment? You can return and resume it before the timer expires.")) event.preventDefault();
        }}>Leave and resume later</Link>
      </div>
      <p className="meta">The server controls the deadline and calculates your score when you submit.</p>
    </section>
  );
}

export function AssessmentResults() {
  const { attemptId } = useParams();
  const [results, setResults] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const path = attemptId
      ? `/api/preparation/results/${attemptId}`
      : "/api/preparation/results";
    api(path)
      .then((data) => {
        if (!active) return;
        if (attemptId) setDetail(data.result);
        else setResults(data.results || []);
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attemptId]);

  if (loading) return <p>Loading assessment results…</p>;
  if (error) return <section className="stack"><ErrorMessage>{error}</ErrorMessage><Link to="/preparation/tests">Back to assessments</Link></section>;

  if (attemptId && detail) {
    return (
      <section className="stack preparation-page">
        <div className="row page-title-row"><div><p className="meta">PREVIOUS RESULT</p><h1>{detail.test_title}</h1><p className="lede">Submitted {formatDate(detail.submitted_at)}</p></div><Link className="button quiet" to="/preparation/results">All results</Link></div>
        <div className="panel result-summary"><strong className="score-number">{detail.score_percent}%</strong><span>{detail.correct_answers} correct out of {detail.total_questions}</span><span>{detail.answered_questions} answered</span><span>{detail.auto_submitted ? "Automatically submitted" : "Submitted by student"}</span></div>
        <h2>Answer review</h2>
        {detail.questions.map((question, index) => (
          <article className="panel question-panel" key={question.id}>
            <div className="row"><strong>Question {index + 1}</strong><span className={`pill ${question.is_correct ? "available" : "closed"}`}>{question.is_correct ? "Correct" : "Incorrect"}</span></div>
            <h3>{question.prompt}</h3>
            <p className="meta">Your answer: {question.selected_option_index === null ? "Not answered" : question.options[question.selected_option_index]}</p>
            <p className="meta">Correct answer: {question.options[question.correct_option_index]}</p>
          </article>
        ))}
      </section>
    );
  }

  return (
    <section className="stack preparation-page">
      <div className="row page-title-row"><div><p className="meta">YOUR PROGRESS</p><h1>Previous results</h1><p className="lede">Your submitted assessments, scores and attempt details.</p></div><Link className="button" to="/preparation/tests">Browse tests</Link></div>
      {results.length === 0 ? <section className="panel empty-panel"><h2>No results yet</h2><p className="lede">Complete an aptitude test to see your score and answer review here.</p></section> : (
        <div className="grid stack">
          {results.map((result) => (
            <article className="panel result-row" key={result.id}>
              <div><h2>{result.test_title}</h2><p className="meta">{formatDate(result.submitted_at)} · {result.correct_answers}/{result.total_questions} correct</p></div>
              <div className="result-actions"><strong>{result.score_percent}%</strong><Link className="button quiet" to={`/preparation/results/${result.id}`}>View result</Link></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function PreparationResources() {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState("All resources");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/api/preparation/resources")
      .then((data) => { if (active) setResources(data.resources || []); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => ["All resources", ...new Set(resources.map((resource) => resource.category))],
    [resources]
  );
  const visible = category === "All resources"
    ? resources
    : resources.filter((resource) => resource.category === category);
  const completeCount = resources.filter((resource) => resource.completed).length;

  async function updateProgress(resource, completed) {
    setSavingId(resource.id);
    setError("");
    try {
      const data = await api(`/api/preparation/resources/${resource.id}/progress`, {
        method: "PUT",
        body: { completed },
      });
      setResources((current) => current.map((item) =>
        item.id === resource.id ? { ...item, completed: data.progress.completed } : item
      ));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="stack preparation-page">
      <div className="row page-title-row"><div><p className="meta">PLACEMENT PREPARATION</p><h1>Preparation resources</h1><p className="lede">Browse learning material and track what you have completed.</p></div><div className="progress-count">{completeCount} / {resources.length} completed</div></div>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="row resource-controls"><label>Filter by category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
      {loading ? <p>Loading resources…</p> : visible.length === 0 ? <section className="panel empty-panel"><h2>No resources in this category</h2><p className="lede">Select another category to continue.</p></section> : (
        <div className="grid preparation-grid">
          {visible.map((resource) => (
            <article className="card preparation-card" key={resource.id}>
              <div className="row"><span className="pill">{resource.category}</span><span className={`pill ${resource.is_available ? "available" : "closed"}`}>{resource.is_available ? "Available" : "Unavailable"}</span></div>
              <h2>{resource.title}</h2>
              <p className="lede">{resource.description}</p>
              <div className="actions resource-actions">
                {resource.is_available ? <a className="button" href={resource.url} target="_blank" rel="noopener noreferrer">Open resource ↗</a> : <button disabled>Unavailable</button>}
              </div>
              <label className="progress-checkbox"><input type="checkbox" checked={Boolean(resource.completed)} disabled={!resource.is_available || savingId === resource.id} onChange={(event) => updateProgress(resource, event.target.checked)} />
                <span>{savingId === resource.id ? "Saving progress…" : "Mark as completed"}</span>
              </label>
            </article>
          ))}
        </div>
      )}
      <p className="meta">Completion status is saved against your student account and remains available when you sign in again.</p>
    </section>
  );
}
