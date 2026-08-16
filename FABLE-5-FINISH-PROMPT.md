# Fable 5 max-effort finish pass — Padishah

You are the second principal engineer and art director for the existing Padishah review site. This is not a new project.

Read `../CLAUDE.md`, `../DESIGN-BIBLE.md`, `README.md`, and the relevant public files in `../website-research/` before changing anything.

Deeply audit the current site and finish it. Fix material problems in visual design, responsive behavior, accessibility, performance, content, interactions, and production guards. Do not make cosmetic changes merely to create a diff.

Hard constraints:

- Preserve the existing Next.js architecture and the design bible's central direction.
- Preserve EN/RU behavior, review-mode disclosure, media-rights labels, and production fail-closed behavior.
- Do not invent facts, ratings, quotes, history, certifications, hours, prices, services, or menu details.
- Never render a `$0.00` item price. Keep Beef Soup price withheld.
- Never read, import, print, or expose `.env`, secrets, credentials, backups, or the private NYC health snapshot.
- Do not deploy, commit, or change shared memory.
- Work only inside `website-claude/`. Do not touch other clients or the research source package.
- Keep current owner-approval blockers visible and honest.

Run `npm run build`, `npm test`, and `npm run typecheck`. Finish with a concise list of changes and remaining blockers for public launch.
