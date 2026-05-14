# CI Release Gate

GitHub Actions runs the same release gate used locally for pull requests and pushes to `main` or `continued-development`.

Workflow:

```text
.github/workflows/ci.yml
```

Checks:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

The workflow provides CI-only environment values so the Next.js build can validate server routes without using production secrets.

The launch smoke check also asserts that this workflow remains present.
