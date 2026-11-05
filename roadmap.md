# Roadmap

- [x] Add in-app private CRM document previews, requested candidate rows, and stoppable cached Groq correction controls; helper tests and build pass.
- [ ] Run corrections on stored resumes and verify private document previews in the actual CRM; requires the super admin's OTP-verified session.

- [x] Fix CRM Add company opening; draft and required-name saving validation pass tests.

- [x] Simplify /desk into /crm with resume search, candidate placement records, partner companies, and tasks/reminders while preserving existing private data.
- [x] Verify new CRM schema, 29 business/access tests, successful compile, secure /crm gate, /desk redirect, and unchanged homepage without runtime errors.
- [ ] Verify CRM saving, document uploads and desktop/mobile layout after the super admin completes OTP sign-in; the available preview session is not OTP-verified.

- [x] Build the super-admin-only /desk overview, tasks, candidate calls, follow-ups, calendar, activity history and reports.
- [x] Add private bulk resume storage, editable extracted profiles, duplicate safeguards and combined candidate search filters.
- [x] Verify /desk rules, applied security policies, signed-out and unverified-super-admin denial; 24 tests pass and the homepage still opens.
- [x] Verify local extraction in a real browser with PDF, DOCX and scanned-PDF sample resumes; searchable content and email extraction pass without AI calls.

- [x] Show clear employee password validation messages without raw error details; validation tests pass.
- [x] Remove the candidate-view shortcut for employee administrators; checked in an active employee session.
- [x] Add a super-admin-only branded Resend composer and record sending outcomes in email history; sending, failure and duplicate safeguards tested.
- [x] Check receiving support without changing the existing mailbox or domain records; Resend reports a sending-only key.
- [ ] Verify composer preview and a live send in the super-admin panel (current preview session is an employee; requires super-admin OTP sign-in).
- [ ] Enable receiving in the super-admin inbox (requires a Full access Resend key and explicit receiving-domain or mailbox-forwarding setup).

- [x] Add secure code-only Resend OTP for the main administrator.
- [x] Add employee creation, credential emails, mandatory password changes and access management.
- [x] Enforce restricted employee permissions on database and server-function access paths; verify unverified-admin denial and permission tests.
- [ ] Verify live OTP receipt, employee creation, first password change and deactivation in the admin panel (requires the administrator to complete email OTP sign-in).

- [ ] Add admin interview email history and previews of both SOFTCON emails, with truthful delivery states.
- [ ] Complete and verify resume autofill when candidates create their profile.

- [x] Add the supplied ISO 9001:2015 certificate and preview.
- [x] Present MCA, Udyam, and ISO as a polished three-document section.
- [x] Verify the certificate cards and viewer on desktop and mobile.
- [x] Add a faint home-style background image to the About introduction.
- [x] Refine the Jay Doshi founder section with a stronger editorial layout.
- [x] Verify the updated About and founder sections on desktop and mobile.
- [x] Admin OTP email with 6-digit code and supplied logo, without a sign-in link.
- [x] Hide the “Edit with Lovable” badge on published pages.
- [x] Link the Resend connection for server-side app emails.
- [x] Add application confirmation and status-change email automation.
- [x] Add duplicate-safe application email delivery history.
- [x] Verify the Resend sender domain and run live delivery tests.
- [x] Fix admin application status updates returning “Forbidden”.
- [x] Simplify the admin application status menu to essential stages.

- [x] Add an admin-only directory of all registered accounts and complete candidate profiles.
- [x] Fix the mobile jobs list overflow and keep job details and footer readable on narrow screens.
- [x] Add the six-course Fire & Industrial Safety page with the supplied training association logo.
- [x] Verify the Courses page and navigation on desktop and mobile.
- [x] Add a shared WhatsApp job-alert group list for the home page and a floating groups menu.
- [x] Make the floating groups button compact between interactions and refine its group card.
- [x] Extract candidate details from uploaded resumes and prefill a reviewable profile.
- [x] Save the professional summary and show the completed profile to the administrator.
- [ ] Verify resume autofill from both profile and job-application uploads.
- [x] Send the two branded SOFTCON interview emails from info@jaydevassociates.com to omdoshi45@gmail.com.
- [x] CRM: delete candidate, Placed list, Groq resume extraction, new WhatsApp link
