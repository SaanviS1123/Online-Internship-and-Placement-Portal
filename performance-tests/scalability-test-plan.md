# NF-004: 500-Concurrent-User Scalability Test Plan

## Requirement
The SRS specifies support for at least 500 concurrent users. This plan defines proposed operational criteria so the result can be classified Pass or Fail rather than merely reporting that a load test was attempted.

## Approval note
The 90%-within-3-seconds response target comes from the SRS. The p95, error-rate, ramp, and hold thresholds below are QA proposals and must be approved by the Product Owner/tech lead before the run. Record the approver and date in the execution log or the test report. Do not silently change thresholds after seeing results.

## Preconditions
- Use an isolated, approved staging/load-test environment—not production and not an unrepresentative personal development laptop.
- Integrated build, representative endpoints, database, test data, and cleanup/reset process are ready.
- Choose a load tool capable of creating 500 concurrent virtual users; record version and configuration.
- Record commit/build, instance sizes, CPU/memory, database size/pool settings, network, region, logging/monitoring, and test-tool host resources.
- Define a realistic request mix with the developer and QA lead. Use synthetic accounts/data. Avoid destructive tests and repeated writes without cleanup.

## Proposed execution profile
1. Capture 5 minutes of baseline metrics at low traffic.
2. Ramp gradually to **500 concurrent virtual users over 5 minutes**.
3. Hold **500 concurrent virtual users for 10 continuous minutes** after ramp-up.
4. If the run cannot reach and maintain the target, record it as a failed/incomplete run with the observed maximum concurrency; do not claim a pass.
5. Collect response-time percentiles, request counts, HTTP status distribution, timeouts, connection errors, application exceptions, DB errors, and CPU/memory/DB saturation indicators.
6. Run functional smoke checks before and after the load run to identify crashes or data-integrity problems.

## Pass criteria — every condition must hold
1. **Concurrency:** reach and sustain 500 concurrent virtual users for the full 10-minute steady-state period.
2. **SRS response-time target:** at least **90% of eligible normal requests complete in ≤3 seconds** (equivalent to p90 ≤3 seconds for the agreed request mix).
3. **Additional response-time guardrail (proposed):** p95 response time **≤5 seconds**.
4. **Error-rate guardrail (proposed):** combined HTTP 5xx responses, timeouts, and connection failures are **≤1% of eligible requests** during steady state.
5. **Stability/data integrity:** no application process crash and no observed data corruption, duplicate unintended writes, or cross-user data leakage.

If any condition fails, classify the test Fail (or Blocked if the environment/tool itself prevented a valid run), describe the failure, and attach the raw load report. Report expected 4xx responses from explicit negative validation/authorization scenarios separately; do not count deliberately invalid requests in the eligible business-request error-rate denominator. A legitimate request unexpectedly returning 4xx is an error and should be investigated.

## Evidence to attach
- Tool configuration/scenario and request mix
- Ramp/hold chart and achieved concurrency
- Total eligible requests, errors, and calculation of error rate
- p50/p90/p95/max latency and proportion of requests ≤3 seconds
- Resource/DB saturation metrics and server logs for errors
- Before/after smoke-check outcomes
- Build/commit, test date/time, environment, operator, and approved thresholds

## Current status
Not run. The current local checks did not include load generation. Formal scalability testing remains blocked until the integrated application, representative environment, load tool, and proposed acceptance thresholds are approved.
