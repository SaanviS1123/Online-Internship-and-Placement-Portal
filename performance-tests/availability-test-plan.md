# NF-002: Availability Test Plan

## Requirement

The Online Internship and Placement Preparation Portal must achieve at least 99% availability over an agreed measurement period, as specified in NF-002.

## Availability Measurement

Availability will be evaluated over a measurement period agreed upon by the project team.

Availability percentage will be calculated as:

Availability (%) = ((Total Measurement Time - Unplanned Downtime) / Total Measurement Time) * 100

Planned maintenance and its treatment in the calculation must be agreed upon and documented before testing.

## Monitoring and Failure Identification

During availability testing, record:

- Measurement period and monitoring interval
- Application uptime and downtime
- Start time, end time, and duration of each outage
- HTTP status codes, failed requests, and observed errors
- Suspected cause and impact of each failure
- Recovery actions and time taken to restore service

## Recovery and Restart Procedures

Document the procedures required to:

1. Identify and investigate an application failure.
2. Check application logs and relevant service health.
3. Restart the affected application service when appropriate.
4. Confirm that the portal responds successfully after recovery.
5. Record the incident, recovery actions, and downtime.

These procedures must be validated once the application is implemented.

## Acceptance Criteria

- Availability is at least 99% over the agreed measurement period.
- Application failures and downtime can be identified and recorded.
- Recovery and restart procedures are documented.
- Availability is evaluated using recorded measurements.
- Actual results and any failures to meet the target are documented.

## Status

Test plan drafted. Application monitoring, recovery validation, and availability measurements are pending application implementation and agreement on the measurement period.
