# NF-004: Concurrent Users Test Plan

## Requirement

The Online Internship and Placement Preparation Portal must be load-tested against a target of 500 concurrent users without unacceptable performance degradation.

## Test Objectives

- Evaluate application behavior under a load of up to 500 concurrent users.
- Record response times and errors during the test.
- Identify and document performance bottlenecks.
- Report test results, observations, and limitations.

## Test Approach

Once the application is implemented:

1. Identify the user-facing endpoints and workflows to test.
2. Define the test environment, workload, and test duration.
3. Increase the simulated user load gradually up to 500 concurrent users.
4. Record response times, HTTP status codes, failed requests, and throughput.
5. Observe application resource usage and relevant service logs.
6. Document bottlenecks, failures, and any unexpected behavior.
7. Summarize results and compare them with the agreed acceptance criteria.

## Measurements to Record

- Number of simulated concurrent users
- Test duration and workload profile
- Endpoint and HTTP method
- Average and maximum response times
- Failed requests, error rates, and HTTP status codes
- Requests processed per second, where available
- Relevant CPU, memory, and database observations
- Identified bottlenecks and test limitations

## Acceptance Criteria

- The system is load-tested against a target of 500 concurrent users.
- Response times and errors are recorded during testing.
- Identified bottlenecks are documented.
- Test results and any limitations are reported.

Any additional response-time or error-rate thresholds must be agreed upon by the project team before testing.

## Status

Test plan drafted. Load testing and performance measurements are pending application implementation and availability of a test environment.
