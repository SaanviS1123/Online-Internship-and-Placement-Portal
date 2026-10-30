const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

const router = express.Router();
router.use(authenticateToken, authorizeRole("student"));

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function sendError(res, label, error) {
  console.error(`${label}:`, error.message);
  return res.status(500).json({
    success: false,
    message: "Unable to complete the preparation request.",
  });
}

function publicQuestion(row) {
  return {
    id: row.id,
    prompt: row.prompt,
    options: row.options,
    points: row.points,
    position: row.position,
  };
}

async function getAttemptPayload(queryable, attemptId, studentId) {
  const attemptResult = await queryable.query(
    `SELECT a.id, a.student_id, a.test_id, a.status, a.started_at,
            a.expires_at, (a.expires_at <= CURRENT_TIMESTAMP) AS is_expired,
            CURRENT_TIMESTAMP AS server_now, a.submitted_at, a.answers,
            a.answered_questions, a.correct_answers, a.total_questions,
            a.score_percent, a.auto_submitted, t.title AS test_title,
            t.duration_seconds
     FROM assessment_attempts a
     JOIN assessment_tests t ON t.id = a.test_id
     WHERE a.id = $1 AND a.student_id = $2`,
    [attemptId, studentId]
  );

  if (attemptResult.rows.length === 0) return null;
  const attempt = attemptResult.rows[0];
  const questionResult = await queryable.query(
    `SELECT id, prompt, options, points, position
     FROM assessment_questions
     WHERE test_id = $1
     ORDER BY position ASC`,
    [attempt.test_id]
  );

  return {
    id: attempt.id,
    test_id: attempt.test_id,
    test_title: attempt.test_title,
    status: attempt.status,
    started_at: attempt.started_at,
    expires_at: attempt.expires_at,
    is_expired: attempt.is_expired,
    server_now: attempt.server_now,
    submitted_at: attempt.submitted_at,
    duration_seconds: attempt.duration_seconds,
    answers: attempt.answers || {},
    answered_questions: attempt.answered_questions,
    correct_answers: attempt.correct_answers,
    total_questions: attempt.total_questions,
    score_percent: attempt.score_percent,
    auto_submitted: attempt.auto_submitted,
    questions: questionResult.rows.map(publicQuestion),
  };
}

async function finalizeAttempt(client, attempt, studentId) {
  const questionResult = await client.query(
    `SELECT id, options, correct_option_index, points
     FROM assessment_questions
     WHERE test_id = $1`,
    [attempt.test_id]
  );
  const answers = attempt.answers && typeof attempt.answers === "object"
    ? attempt.answers
    : {};
  let answered = 0;
  let correct = 0;
  let earnedPoints = 0;
  let possiblePoints = 0;

  for (const question of questionResult.rows) {
    const points = Number(question.points) || 1;
    possiblePoints += points;
    const selected = answers[String(question.id)];
    if (Number.isInteger(selected) && selected >= 0 && selected < question.options.length) {
      answered += 1;
      if (selected === question.correct_option_index) {
        correct += 1;
        earnedPoints += points;
      }
    }
  }

  const clock = await client.query("SELECT CURRENT_TIMESTAMP AS server_now");
  const expired = new Date(attempt.expires_at).getTime() <= new Date(clock.rows[0].server_now).getTime();
  const autoSubmitted = expired;
  const percentage = possiblePoints > 0
    ? Math.round((earnedPoints / possiblePoints) * 100)
    : 0;
  const updated = await client.query(
    `UPDATE assessment_attempts
     SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP,
         answered_questions = $1, correct_answers = $2,
         total_questions = $3, score_percent = $4,
         auto_submitted = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 AND student_id = $7 AND status = 'in_progress'
     RETURNING id, status, submitted_at, answered_questions,
               correct_answers, total_questions, score_percent, auto_submitted`,
    [answered, correct, questionResult.rows.length, percentage, autoSubmitted, attempt.id, studentId]
  );

  return updated.rows[0] || null;
}

// F-013: students can view available and unavailable assessments without seeing answer keys.
router.get("/tests", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.title, t.category, t.description, t.duration_seconds,
              t.is_available,
              COUNT(q.id)::integer AS question_count
       FROM assessment_tests t
       LEFT JOIN assessment_questions q ON q.test_id = t.id
       GROUP BY t.id
       ORDER BY t.sort_order ASC, t.title ASC`
    );
    return res.status(200).json({ success: true, tests: result.rows });
  } catch (error) {
    return sendError(res, "Assessment list failed", error);
  }
});

// F-014: starting an assessment creates a server-timed attempt, or resumes an active one.
router.post("/tests/:testId/attempts", async (req, res) => {
  const testId = parseId(req.params.testId);
  if (!testId) {
    return res.status(400).json({ success: false, message: "Invalid assessment id." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const testResult = await client.query(
      `SELECT id, title, duration_seconds, is_available
       FROM assessment_tests WHERE id = $1 FOR UPDATE`,
      [testId]
    );
    const test = testResult.rows[0];
    if (!test) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }
    if (!test.is_available) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, message: "This assessment is not currently available." });
    }

    const activeResult = await client.query(
      `SELECT id, test_id, expires_at, answers,
              (expires_at <= CURRENT_TIMESTAMP) AS is_expired
       FROM assessment_attempts
       WHERE student_id = $1 AND test_id = $2 AND status = 'in_progress'
       ORDER BY started_at DESC LIMIT 1 FOR UPDATE`,
      [req.user.userId, testId]
    );
    if (activeResult.rows[0]) {
      const active = activeResult.rows[0];
      if (active.is_expired) {
        await finalizeAttempt(client, active, req.user.userId);
      } else {
        await client.query("COMMIT");
        const payload = await getAttemptPayload(pool, active.id, req.user.userId);
        return res.status(200).json({ success: true, resumed: true, attempt: payload });
      }
    }

    const inserted = await client.query(
      `INSERT INTO assessment_attempts (student_id, test_id, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + ($3 * INTERVAL '1 second'))
       RETURNING id`,
      [req.user.userId, testId, test.duration_seconds]
    );
    await client.query("COMMIT");
    const payload = await getAttemptPayload(pool, inserted.rows[0].id, req.user.userId);
    return res.status(201).json({ success: true, resumed: false, attempt: payload });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "An active attempt already exists. Reopen the assessment to resume it." });
    }
    return sendError(res, "Assessment start failed", error);
  } finally {
    client.release();
  }
});

// Loads an attempt only for its owner. Answer keys are never included while in progress.
router.get("/attempts/:attemptId", async (req, res) => {
  const attemptId = parseId(req.params.attemptId);
  if (!attemptId) {
    return res.status(400).json({ success: false, message: "Invalid attempt id." });
  }
  try {
    const attempt = await getAttemptPayload(pool, attemptId, req.user.userId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found." });
    }
    if (attempt.status === "in_progress" && attempt.is_expired) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const locked = await client.query(
          `SELECT id, test_id, expires_at, answers FROM assessment_attempts
           WHERE id = $1 AND student_id = $2 AND status = 'in_progress'
             AND expires_at <= CURRENT_TIMESTAMP FOR UPDATE`,
          [attemptId, req.user.userId]
        );
        if (locked.rows[0]) await finalizeAttempt(client, locked.rows[0], req.user.userId);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        client.release();
      }
      const updated = await getAttemptPayload(pool, attemptId, req.user.userId);
      return res.status(200).json({ success: true, attempt: updated });
    }
    return res.status(200).json({ success: true, attempt });
  } catch (error) {
    return sendError(res, "Attempt retrieval failed", error);
  }
});

// Persist draft answers without accepting a client-computed score.
router.put("/attempts/:attemptId/answers", async (req, res) => {
  const attemptId = parseId(req.params.attemptId);
  const answers = req.body?.answers;
  if (!attemptId || !answers || typeof answers !== "object" || Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: "A valid attempt id and answers object are required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const attemptResult = await client.query(
      `SELECT id, test_id, status, expires_at, answers,
              (expires_at <= CURRENT_TIMESTAMP) AS is_expired
       FROM assessment_attempts
       WHERE id = $1 AND student_id = $2 FOR UPDATE`,
      [attemptId, req.user.userId]
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Attempt not found." });
    }
    if (attempt.status !== "in_progress") {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, message: "This attempt has already been submitted." });
    }
    if (attempt.is_expired) {
      await finalizeAttempt(client, attempt, req.user.userId);
      await client.query("COMMIT");
      return res.status(409).json({ success: false, message: "Time has expired. Your saved answers have been submitted automatically." });
    }

    const questionResult = await client.query(
      `SELECT id, options FROM assessment_questions WHERE test_id = $1`,
      [attempt.test_id]
    );
    const allowed = new Map(questionResult.rows.map((q) => [String(q.id), q.options.length]));
    const safeAnswers = {};
    for (const [questionId, selected] of Object.entries(answers)) {
      const optionCount = allowed.get(questionId);
      if (!optionCount || !Number.isInteger(selected) || selected < 0 || selected >= optionCount) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "One or more answers are invalid." });
      }
      safeAnswers[questionId] = selected;
    }
    await client.query(
      `UPDATE assessment_attempts
       SET answers = $1::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND student_id = $3`,
      [JSON.stringify(safeAnswers), attemptId, req.user.userId]
    );
    await client.query("COMMIT");
    return res.status(200).json({ success: true, message: "Answers saved." });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return sendError(res, "Answer save failed", error);
  } finally {
    client.release();
  }
});

// F-015: scoring is calculated on the server from the database answer key.
router.post("/attempts/:attemptId/submit", async (req, res) => {
  const attemptId = parseId(req.params.attemptId);
  if (!attemptId) {
    return res.status(400).json({ success: false, message: "Invalid attempt id." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const attemptResult = await client.query(
      `SELECT id, test_id, status, expires_at, answers
       FROM assessment_attempts
       WHERE id = $1 AND student_id = $2 FOR UPDATE`,
      [attemptId, req.user.userId]
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Attempt not found." });
    }

    let result;
    if (attempt.status === "submitted") {
      result = await client.query(
        `SELECT id, status, submitted_at, answered_questions, correct_answers,
                total_questions, score_percent, auto_submitted
         FROM assessment_attempts WHERE id = $1`,
        [attemptId]
      );
    } else {
      result = { rows: [await finalizeAttempt(client, attempt, req.user.userId)] };
    }
    await client.query("COMMIT");
    return res.status(200).json({ success: true, result: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return sendError(res, "Assessment submission failed", error);
  } finally {
    client.release();
  }
});

// F-016: attempt history is scoped to the authenticated student.
router.get("/results", async (req, res) => {
  try {
    // Finalize expired attempts when the student next opens their result history.
    const expiredAttempts = await pool.query(
      `SELECT id FROM assessment_attempts
       WHERE student_id = $1 AND status = 'in_progress'
         AND expires_at <= CURRENT_TIMESTAMP`,
      [req.user.userId]
    );
    if (expiredAttempts.rows.length > 0) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const row of expiredAttempts.rows) {
          const locked = await client.query(
            `SELECT id, test_id, expires_at, answers FROM assessment_attempts
             WHERE id = $1 AND student_id = $2 AND status = 'in_progress'
               AND expires_at <= CURRENT_TIMESTAMP FOR UPDATE`,
            [row.id, req.user.userId]
          );
          if (locked.rows[0]) await finalizeAttempt(client, locked.rows[0], req.user.userId);
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    }

    const result = await pool.query(
      `SELECT a.id, a.status, a.started_at, a.submitted_at,
              a.answered_questions, a.correct_answers, a.total_questions,
              a.score_percent, a.auto_submitted, t.title AS test_title
       FROM assessment_attempts a
       JOIN assessment_tests t ON t.id = a.test_id
       WHERE a.student_id = $1 AND a.status = 'submitted'
       ORDER BY a.submitted_at DESC`,
      [req.user.userId]
    );
    return res.status(200).json({ success: true, results: result.rows });
  } catch (error) {
    return sendError(res, "Assessment history failed", error);
  }
});

router.get("/results/:attemptId", async (req, res) => {
  const attemptId = parseId(req.params.attemptId);
  if (!attemptId) {
    return res.status(400).json({ success: false, message: "Invalid result id." });
  }
  try {
    const attemptResult = await pool.query(
      `SELECT a.id, a.status, a.started_at, a.submitted_at,
              a.answered_questions, a.correct_answers, a.total_questions,
              a.score_percent, a.auto_submitted, a.answers,
              t.title AS test_title
       FROM assessment_attempts a
       JOIN assessment_tests t ON t.id = a.test_id
       WHERE a.id = $1 AND a.student_id = $2`,
      [attemptId, req.user.userId]
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Result not found." });
    }
    if (attempt.status !== "submitted") {
      return res.status(409).json({ success: false, message: "This attempt has not been submitted." });
    }
    const questions = await pool.query(
      `SELECT id, prompt, options, correct_option_index, points, position
       FROM assessment_questions
       WHERE test_id = (
         SELECT test_id FROM assessment_attempts WHERE id = $1
       ) ORDER BY position ASC`,
      [attemptId]
    );
    const answers = attempt.answers || {};
    const review = questions.rows.map((q) => {
      const selected = answers[String(q.id)];
      return {
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        selected_option_index: Number.isInteger(selected) ? selected : null,
        correct_option_index: q.correct_option_index,
        is_correct: Number.isInteger(selected) && selected === q.correct_option_index,
        points: q.points,
      };
    });
    return res.status(200).json({ success: true, result: { ...attempt, questions: review } });
  } catch (error) {
    return sendError(res, "Assessment result retrieval failed", error);
  }
});

// F-017 and F-018: resource catalogue and per-student persisted progress.
router.get("/resources", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.category, r.title, r.description, r.url,
              r.is_available, r.sort_order,
              COALESCE(p.completed, FALSE) AS completed
       FROM preparation_resources r
       LEFT JOIN student_resource_progress p
         ON p.resource_id = r.id AND p.student_id = $1
       ORDER BY r.sort_order ASC, r.title ASC`,
      [req.user.userId]
    );
    return res.status(200).json({ success: true, resources: result.rows });
  } catch (error) {
    return sendError(res, "Resource list failed", error);
  }
});

router.put("/resources/:resourceId/progress", async (req, res) => {
  const resourceId = parseId(req.params.resourceId);
  const completed = req.body?.completed;
  if (!resourceId || typeof completed !== "boolean") {
    return res.status(400).json({ success: false, message: "A valid resource id and completed boolean are required." });
  }
  try {
    const resource = await pool.query(
      `SELECT id, is_available FROM preparation_resources WHERE id = $1`,
      [resourceId]
    );
    if (!resource.rows[0]) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }
    if (!resource.rows[0].is_available) {
      return res.status(409).json({ success: false, message: "Unavailable resources cannot be marked complete." });
    }
    const updated = await pool.query(
      `INSERT INTO student_resource_progress (student_id, resource_id, completed)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, resource_id)
       DO UPDATE SET completed = EXCLUDED.completed,
                     updated_at = CURRENT_TIMESTAMP
       RETURNING resource_id, completed, updated_at`,
      [req.user.userId, resourceId, completed]
    );
    return res.status(200).json({ success: true, progress: updated.rows[0] });
  } catch (error) {
    return sendError(res, "Resource progress update failed", error);
  }
});

module.exports = router;
