# Contributing to SafePredict

Thank you for helping improve SafePredict.

## Workflow

1. Open an issue before large changes so the scope stays clear.
2. Create a feature branch from `main`.
3. Keep changes small and focused.
4. Add or update tests when behavior changes.
5. Run the available checks before opening a pull request.

## Local checks

Backend:

```powershell
py -3 -m unittest discover -s backend/tests -p "test_*.py"
```

Frontend:

```powershell
cd frontend
npm run build
```

## Pull request notes

- Describe what changed and why.
- Mention any new environment variables or setup steps.
- Include screenshots or sample output if the change affects the UI or API behavior.

## Code style

- Prefer small, readable functions.
- Keep API responses explicit and typed.
- Match the existing style in the touched files.

## Questions

If something is unclear, open an issue or leave a note in the pull request discussion.