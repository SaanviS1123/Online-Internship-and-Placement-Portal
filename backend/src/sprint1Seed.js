require("./env");
const pool = require("./db");

const tests = [
  {
    slug: "aptitude-foundations",
    title: "Aptitude Foundations",
    category: "Quantitative aptitude",
    description: "Practice percentages, ratios, averages and basic numerical reasoning.",
    duration: 300,
    available: true,
    order: 1,
    questions: [
      { prompt: "What is 20% of 250?", options: ["25", "40", "50", "60"], answer: 2 },
      { prompt: "The average of 6, 8 and 10 is:", options: ["7", "8", "9", "10"], answer: 1 },
      { prompt: "A ratio is 2:3 and the total is 25. What is the smaller part?", options: ["5", "10", "12", "15"], answer: 1 },
      { prompt: "A value increases from 80 to 100. What is the percentage increase?", options: ["20%", "25%", "30%", "40%"], answer: 1 },
      { prompt: "If 4 notebooks cost ₹60, what do 2 notebooks cost at the same rate?", options: ["₹15", "₹20", "₹30", "₹45"], answer: 2 },
    ],
  },
  {
    slug: "web-technology-basics",
    title: "Web Technology Basics",
    category: "Technical preparation",
    description: "Check foundational knowledge of HTML, JavaScript and web requests.",
    duration: 420,
    available: true,
    order: 2,
    questions: [
      { prompt: "Which HTML element represents the main heading?", options: ["<p>", "<h1>", "<head>", "<title>"], answer: 1 },
      { prompt: "Which keyword declares a block-scoped variable that can be reassigned?", options: ["const", "let", "static", "define"], answer: 1 },
      { prompt: "Which HTTP method is commonly used to retrieve a resource?", options: ["GET", "PATCH", "DELETE", "TRACE"], answer: 0 },
      { prompt: "Which value represents a strict boolean false?", options: ["'false'", "0 only", "false", "null only"], answer: 2 },
      { prompt: "What does CSS primarily control?", options: ["Database storage", "Page presentation", "Network routing", "Authentication tokens"], answer: 1 },
    ],
  },
  {
    slug: "advanced-mock-assessment",
    title: "Advanced Mock Assessment",
    category: "Mock tests",
    description: "This assessment is not currently open. Check back when it becomes available.",
    duration: 600,
    available: false,
    order: 3,
    questions: [],
  },
];

const resources = [
  {
    slug: "quantitative-aptitude-practice",
    category: "Aptitude practice",
    title: "Quantitative Aptitude Practice",
    description: "Practice arithmetic, percentages, ratios and quantitative problem-solving.",
    url: "https://www.geeksforgeeks.org/quantitative-aptitude/",
    available: true,
    order: 1,
  },
  {
    slug: "hackerrank-problem-solving",
    category: "Aptitude practice",
    title: "HackerRank Problem Solving",
    description: "Work through programming and problem-solving exercises at different levels.",
    url: "https://www.hackerrank.com/domains/algorithms",
    available: true,
    order: 2,
  },
  {
    slug: "mdn-web-development",
    category: "Technical preparation",
    title: "MDN Web Development",
    description: "Review HTML, CSS, JavaScript and web platform concepts.",
    url: "https://developer.mozilla.org/en-US/docs/Learn",
    available: true,
    order: 3,
  },
  {
    slug: "javascript-guide",
    category: "Technical preparation",
    title: "JavaScript Guide",
    description: "Read language fundamentals, functions, objects and asynchronous JavaScript.",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    available: true,
    order: 4,
  },
  {
    slug: "interview-preparation-guidance",
    category: "Interview guidance",
    title: "Interview Preparation Guidance",
    description: "Review practical advice for researching an employer and preparing interview examples.",
    url: "https://www.indeed.com/career-advice/interviewing",
    available: true,
    order: 5,
  },
  {
    slug: "retired-practice-link",
    category: "Interview guidance",
    title: "Retired Practice Link (demo)",
    description: "Example of a resource that has been marked unavailable and cannot be opened.",
    url: null,
    available: false,
    order: 6,
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const test of tests) {
      const saved = await client.query(
        `INSERT INTO assessment_tests
           (slug, title, category, description, duration_seconds, is_available, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           category = EXCLUDED.category,
           description = EXCLUDED.description,
           duration_seconds = EXCLUDED.duration_seconds,
           is_available = EXCLUDED.is_available,
           sort_order = EXCLUDED.sort_order,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [test.slug, test.title, test.category, test.description, test.duration, test.available, test.order]
      );
      const testId = saved.rows[0].id;
      for (let index = 0; index < test.questions.length; index += 1) {
        const question = test.questions[index];
        if (question.answer < 0 || question.answer >= question.options.length) {
          throw new Error(`Invalid answer index in ${test.slug}, question ${index + 1}.`);
        }
        await client.query(
          `INSERT INTO assessment_questions
             (test_id, prompt, options, correct_option_index, points, position)
           VALUES ($1, $2, $3::jsonb, $4, 1, $5)
           ON CONFLICT (test_id, position) DO UPDATE SET
             prompt = EXCLUDED.prompt,
             options = EXCLUDED.options,
             correct_option_index = EXCLUDED.correct_option_index,
             points = EXCLUDED.points`,
          [testId, question.prompt, JSON.stringify(question.options), question.answer, index + 1]
        );
      }
      await client.query(
        `DELETE FROM assessment_questions WHERE test_id = $1 AND position > $2`,
        [testId, test.questions.length]
      );
    }

    for (const resource of resources) {
      await client.query(
        `INSERT INTO preparation_resources
           (slug, category, title, description, url, is_available, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (slug) DO UPDATE SET
           category = EXCLUDED.category,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           url = EXCLUDED.url,
           is_available = EXCLUDED.is_available,
           sort_order = EXCLUDED.sort_order,
           updated_at = CURRENT_TIMESTAMP`,
        [resource.slug, resource.category, resource.title, resource.description,
          resource.url, resource.available, resource.order]
      );
    }

    await client.query("COMMIT");
    console.log("Sprint 1 assessment and preparation-resource sample data seeded.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Sprint 1 seed failed:", error.message);
  process.exitCode = 1;
  pool.end().catch(() => {});
});
