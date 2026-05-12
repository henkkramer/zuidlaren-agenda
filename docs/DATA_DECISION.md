# Data Decision

This project may have files that look like data.

Rule:
- Runtime user data, databases, uploads and logs must not go into Git.
- Static product content, such as lessons, word lists, exercises or fixed assets, may go into Git.
- If static product content currently lives in data/, move it to src/content/ or public/content/ before committing.

Current Git policy:
data/ is ignored by .gitignore.

Review needed before first serious commit:
- Check whether data/ contains runtime data or product content.
- Check whether uploads/ contains runtime uploads or fixed app assets.
