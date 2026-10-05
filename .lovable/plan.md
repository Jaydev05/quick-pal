# Automatic resume profile creation

## What will change
- Add secure resume analysis for PDF and Word uploads, available from both **My Profile** and the existing job application form.
- Extract the available candidate name, phone, city/state, current job title, experience, education, skills, and a concise professional summary.
- Prefill the candidate form with extracted details without overwriting useful information the candidate already entered.
- Keep the extracted fields editable so the candidate can correct anything before saving or submitting an application.

## Profile and administrator view
- Save the resume and reviewed information into the existing candidate profile rather than creating a separate profile system.
- Add a professional-summary field to the existing profile record with the same candidate/staff access protections.
- Show the summary with the other candidate details in the administrator's existing Candidates tab and CSV export.

## Security and reliability
- Parse resumes only through an authenticated server action; AI credentials and resume contents will not be exposed to other users.
- Validate file type, size, ownership, extracted values, and structured results before updating any form or profile.
- If analysis fails or a resume is image-only/unclear, keep normal manual profile entry and resume upload working with a clear message.

## Verification
- Test PDF and Word resume uploads, extracted-field review, profile saving, and unchanged existing values.
- Verify the application form uses the same extraction flow and still submits applications normally.
- Confirm the administrator sees the saved summary and full profile, and check desktop/mobile layouts and current diagnostics.