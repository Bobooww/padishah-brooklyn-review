# Production checklist

- [ ] Owner-approved current hours and approval date are recorded in `production-approvals.json`.
- [ ] The exact current menu has an approval date; item names, descriptions, prices, availability, and duplicate/invalid flags are resolved.
- [ ] The deployed logo master exists under `public/` and has an approval date.
- [ ] Canonical order and reservation links, with approval dates, are recorded.
- [ ] Website copy has written owner approval and an approval date.
- [ ] Every media asset referenced by the site is client-cleared, `production_approved: true`, and has owner-approved alt text.
- [ ] Current 2026 location photography replaces pre-relaunch references.
- [ ] `SITE_REVIEW_MODE=false npm run build` passes without bypassing safeguards.
- [ ] Keyboard, reduced-motion, contrast, mobile, and final rendered-output checks pass.
