# SR-005: HTTPS/TLS Security Checklist

## Requirement

Configure the deployed Online Internship and Placement Preparation Portal to use HTTPS/TLS to protect data transmitted between users and the application.

## 1. HTTPS Access

- [ ] Confirm the deployed application is accessible through HTTPS.
- [ ] Verify that the TLS certificate is valid and has not expired.
- [ ] Verify that the certificate matches the deployed domain.
- [ ] Confirm that browsers do not report certificate or connection security warnings.

**Status:** Pending deployment and verification.

## 2. HTTP-to-HTTPS Redirection

- [ ] Configure HTTP requests to redirect to HTTPS where appropriate.
- [ ] Verify the redirect behavior after deployment.
- [ ] Confirm that sensitive pages and endpoints are not served over unencrypted HTTP.

**Status:** Pending deployment and verification.

## 3. Credentials and Sensitive Data

- [ ] Ensure authentication credentials and sensitive data are transmitted only over secure connections.
- [ ] Avoid placing passwords, tokens, or other secrets in URLs.
- [ ] Ensure application configuration does not expose secrets.
- [ ] Verify secure connection behavior for login and other sensitive workflows.

**Status:** Pending application implementation and security testing.

## 4. Deployment Configuration Review

- [ ] Review the hosting platform's HTTPS/TLS configuration.
- [ ] Verify certificate provisioning and renewal arrangements.
- [ ] Review HTTP-to-HTTPS redirect rules.
- [ ] Check security-related deployment settings before release.
- [ ] Record any configuration issues and their resolutions.

**Status:** Pending selection and configuration of the deployment environment.

## 5. Verification Results

Record the following when testing is possible:

- Deployment URL and test date
- Certificate validity and expiration
- HTTP redirect behavior
- Results of secure-connection checks
- Issues identified and corrective actions

## Current Status

The HTTPS/TLS checklist has been drafted. HTTPS access, redirects, certificate validity, and deployment security configuration have not yet been verified because deployment and testing are pending.
