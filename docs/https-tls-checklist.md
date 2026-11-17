
# SR-005: HTTPS/TLS Security Checklist

## 1. Requirement

Configure the deployed Online Internship and Placement Preparation Portal to use HTTPS/TLS to protect data transmitted between users and the application.

## 2. Current Application Status

The project now contains a React frontend, Node.js and Express backend, and PostgreSQL database integration.

The application implementation has progressed beyond the initial planning stage. However, HTTPS/TLS compliance must be verified in the actual deployment environment.

The existence of application code does not prove that a valid TLS certificate, HTTPS connection, or HTTP-to-HTTPS redirect is configured.

## 3. HTTPS Access

- [ ] Confirm that the deployed application is accessible through HTTPS.
- [ ] Verify that the TLS certificate is valid and has not expired.
- [ ] Verify that the certificate matches the deployed domain.
- [ ] Confirm that browsers do not report certificate or connection security warnings.

**Status:** Deployment verification required.

## 4. HTTP-to-HTTPS Redirection

- [ ] Configure HTTP requests to redirect to HTTPS where appropriate.
- [ ] Verify redirect behavior after deployment.
- [ ] Confirm that sensitive pages and endpoints are not served over unencrypted HTTP.

**Status:** Deployment verification required.

## 5. Credentials and Sensitive Data

- [ ] Ensure authentication credentials and sensitive data are transmitted only over secure connections.
- [ ] Avoid placing passwords, tokens, or other secrets in URLs.
- [ ] Ensure application configuration does not expose secrets.
- [ ] Verify secure connection behavior for login and other sensitive workflows.

**Status:** Application configuration and deployed security behavior require review.

## 6. Deployment Configuration Review

- [ ] Identify the deployment platform and hosting configuration.
- [ ] Review the platform's HTTPS/TLS settings.
- [ ] Verify certificate provisioning and renewal arrangements.
- [ ] Review HTTP-to-HTTPS redirect rules.
- [ ] Check security-related deployment settings before release.
- [ ] Record configuration issues and their resolutions.

**Status:** Deployment configuration must be confirmed and reviewed.

## 7. Verification Results

Record the following when testing is performed:

- Deployment URL
- Test date
- Certificate validity and expiration
- Certificate domain match
- HTTP redirect behavior
- Results of secure-connection checks
- Issues identified
- Corrective actions taken

| Verification Item | Result | Evidence |
|---|---|---|
| HTTPS access | Pending | To be recorded |
| TLS certificate validity | Pending | To be recorded |
| Domain match | Pending | To be recorded |
| HTTP-to-HTTPS redirect | Pending | To be recorded |
| Secure login connection | Pending | To be recorded |

## 8. Current Status

The HTTPS/TLS requirement and security verification checklist have been documented.

The application implementation is now available in the repository. However, deployed HTTPS access, certificate validity, redirects, and deployment security configuration have not been verified by this checklist.

**Verification status:** Pending deployment security verification.
