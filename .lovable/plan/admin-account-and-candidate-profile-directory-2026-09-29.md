# Admin account and candidate profile directory

## What will change
- Add a **Candidates** tab to the existing admin console without redesigning the other tabs.
- List every registered candidate account, including candidates who have not applied for a job yet.
- Show account details and all existing profile fields: name, email, phone, location, job title, experience, education, skills, preferred location/category, expected salary, resume, registration date, and last sign-in where available.
- Include application and saved-job counts to help the administrator understand each candidate’s activity.
- Add search and CSV export, plus a clear expanded profile view for dense details.

## Security and accuracy
- Load account records through an authenticated server action that verifies the caller is the administrator.
- Read account identity data only on the server; do not expose credentials, tokens, or private authentication fields.
- Merge registered accounts with existing profile, role, application, category, and saved-job data so accounts remain visible even when a profile is incomplete.
- Keep the current roles, authentication, database structure, application flow, status controls, and other admin screens unchanged.

## Verification
- Check the admin-only access path and empty/incomplete profile handling.
- Verify search, profile expansion, resume access, and CSV export.
- Confirm the existing admin tabs and application status/email flow still work, then test the page on desktop and mobile.
