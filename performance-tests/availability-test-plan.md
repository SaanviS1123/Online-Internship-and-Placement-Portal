
# NF-002: Availability Test Plan

## 1. Requirement

The Online Internship and Placement Preparation Portal must achieve at least 99% availability over an agreed measurement period.

## 2. Current Application Status

The project contains a React frontend, a Node.js and Express backend, and PostgreSQL database integration.

The application has progressed beyond the initial implementation-planning stage. However, the 99% availability target requires monitoring over an agreed period and cannot be confirmed from the presence of application code alone.

## 3. Test Objectives

- Evaluate whether the application remains accessible during the agreed monitoring period.
- Record application uptime and unplanned downtime.
- Identify application failures and service interruptions.
- Record recovery actions and restoration time.
- Compare measured availability against the 99% target.

## 4. Availability Calculation

Availability will be calculated using:

Availability (%) = ((Total Measurement Time - Unplanned Downtime) / Total Measurement Time) × 100

The treatment of planned maintenance must be agreed upon and documented before measurement begins.

## 5. Monitoring and Failure Identification

During availability monitoring, record:

- Measurement period and monitoring interval
- Application uptime and downtime
- Start time and end time of each outage
- Duration of each outage
- HTTP status codes and failed requests
- Observed application errors
- Suspected cause and impact of each failure
- Recovery actions and restoration time

## 6. Recovery and Restart Procedures

When an application failure occurs:

1. Identify and investigate the failure.
2. Check application logs and service health.
3. Inspect relevant backend and database errors.
4. Restart the affected service when appropriate.
5. Confirm that the application responds successfully after recovery.
6. Record the incident, recovery actions, and downtime.

These procedures must be validated in the configured test or deployment environment.

## 7. Acceptance Criteria

- Measured availability is at least 99% over the agreed measurement period.
- Application downtime and failures are recorded.
- Recovery and restart procedures are documented.
- Availability is calculated using recorded measurements.
- Any failure to meet the target is documented with observations.

## 8. Availability Results

| Measurement Period | Total Time | Downtime | Availability | Result |
|---|---|---|---|---|
| To be recorded | - | - | - | Pending |

## 9. Current Status

The availability requirement, calculation method, monitoring approach, and recovery procedure have been documented.

Actual availability measurements and recovery verification have not been established by this document.

**Verification status:** Pending monitoring and measurement.

**Target:** At least 99% availability.
