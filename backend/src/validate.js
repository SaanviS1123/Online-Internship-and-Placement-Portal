const APPLICATION_STATUSES = [
  "submitted",
  "under_review",
  "accepted",
  "rejected",
];

const LISTING_FIELDS = [
  ["title", "Title", 3, 150],
  ["organisation", "Organisation", 2, 150],
  ["description", "Description", 10, 4000],
  ["eligibility", "Eligibility", 2, 255],
  ["location", "Location", 2, 120],
];

function textField(body, key, label, min, max) {
  const value = body[key];

  if (typeof value !== "string" || !value.trim()) {
    return { error: `${label} is required.` };
  }

  const trimmed = value.trim();

  if (trimmed.length < min) {
    return { error: `${label} must be at least ${min} characters.` };
  }

  if (trimmed.length > max) {
    return { error: `${label} must be at most ${max} characters.` };
  }

  return { value: trimmed };
}

function deadlineField(value) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: "Deadline must be a date in YYYY-MM-DD format." };
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return { error: "Deadline is not a real date." };
  }

  const today = new Date();
  const todayValue = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (value < todayValue) {
    return { error: "Deadline cannot be in the past." };
  }

  return { value };
}

function validateListing(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Listing details must be sent as an object." };
  }

  const listing = {};

  for (const [key, label, min, max] of LISTING_FIELDS) {
    const result = textField(body, key, label, min, max);

    if (result.error) {
      return result;
    }

    listing[key] = result.value;
  }

  const deadline = deadlineField(body.deadline);

  if (deadline.error) {
    return deadline;
  }

  listing.deadline = deadline.value;
  return { value: listing };
}

function optionalQuery(value, label) {
  if (value === undefined) {
    return { value: null };
  }

  if (Array.isArray(value) || typeof value !== "string") {
    return { error: `${label} must be a single value.` };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return { value: null };
  }

  if (trimmed.length > 80) {
    return { error: `${label} must be at most 80 characters.` };
  }

  return { value: trimmed };
}

function likePattern(value) {
  if (!value) {
    return null;
  }

  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

function parseId(value, label) {
  if (!/^\d+$/.test(String(value))) {
    return { error: `${label} must be a positive number.` };
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: `${label} must be a positive number.` };
  }

  return { value: id };
}

function validateStatus(value) {
  if (typeof value !== "string" || !APPLICATION_STATUSES.includes(value)) {
    return {
      error:
        "Status must be submitted, under review, accepted, or rejected.",
    };
  }

  return { value };
}

function publicInternship(row) {
  return {
    id: row.id,
    title: row.title,
    organisation: row.organisation,
    description: row.description,
    eligibility: row.eligibility,
    location: row.location,
    deadline: row.deadline,
    availability: row.availability,
  };
}

module.exports = {
  APPLICATION_STATUSES,
  validateListing,
  optionalQuery,
  likePattern,
  parseId,
  validateStatus,
  publicInternship,
};
