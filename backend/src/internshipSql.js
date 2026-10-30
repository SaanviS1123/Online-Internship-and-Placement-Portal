const internshipColumns = `
  i.id,
  i.title,
  i.organisation,
  i.description,
  i.eligibility,
  i.location,
  to_char(i.deadline, 'YYYY-MM-DD') AS deadline,
  CASE
    WHEN i.is_active = FALSE THEN 'closed'
    WHEN i.deadline IS NOT NULL AND i.deadline < CURRENT_DATE THEN 'expired'
    ELSE 'open'
  END AS availability
`;

const availableOnly = `
  i.is_active = TRUE
  AND (i.deadline IS NULL OR i.deadline >= CURRENT_DATE)
`;

module.exports = { internshipColumns, availableOnly };
