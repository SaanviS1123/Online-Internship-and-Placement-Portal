
# NF-004: Concurrent Users Test Plan

## 1. Requirement

The Online Internship and Placement Preparation Portal must be evaluated against a target of 500 concurrent users without unacceptable performance degradation.

## 2. Current Application Status

The project now contains a React frontend, Node.js and Express backend, and PostgreSQL database integration.

The application has progressed beyond the initial implementation stage. A load test is still required to establish how the application behaves when multiple users access it simultaneously.

The presence of implemented features does not establish that the application can currently support 500 concurrent users.

## 3. Test Objectives

- Evaluate application behavior under a load of up to 500 concurrent users.
- Observe response times under increasing user loads.
- Record failed requests and HTTP errors.
- Monitor application and database behavior.
- Identify performance bottlenecks.
- Document test results and limitations.

## 4. Test Approach

1. Identify important user-facing workflows and API endpoints.
2. Configure a suitable test environment.
3. Define the simulated user workload and test duration.
4. Begin with a small number of concurrent users.
5. Increase the simulated load gradually.
6. Continue testing up to the target of 500 concurrent users.
7. Record response times, throughput, errors, and resource usage.
8. Identify bottlenecks and unexpected application behavior.
9. Prepare a summary of the test results.

## 5. Measurements to Record

- Number of simulated concurrent users
- Test duration
- Workload profile
- Endpoint and HTTP method
- Average response time
- Maximum response time
- Failed requests and error rate
- HTTP status codes
- Requests processed per second, where available
- CPU and memory observations
- Database performance observations
- Identified bottlenecks and limitations

## 6. Acceptance Criteria

- The application is evaluated against the target of 500 concurrent users.
- Response times and failed requests are recorded.
- Application behavior under increasing load is documented.
- Performance bottlenecks are identified.
- Test results and limitations are reported.

Additional response-time and error-rate thresholds must be agreed upon by the project team before testing.

## 7. Test Results

| Concurrent Users | Duration | Average Response Time | Error Rate | Result |
|---:|---|---|---|---|
| To be recorded | - | - | - | Pending |

No results should be entered until load testing has actually been performed.

## 8. Current Status

The concurrent-user requirement and test plan have been documented.

The application implementation is now available in the repository. However, a load test demonstrating support for 500 concurrent users has not been established by this document.

**Verification status:** Pending load testing.

**Target:** 500 concurrent users.
