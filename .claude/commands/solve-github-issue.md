# Solve GitHub Issue with TDD

You are tasked with solving a GitHub issue using Test-Driven Development (TDD) methodology.

## Workflow

### Phase 1: Issue Analysis and Planning
1. Use the Task tool to launch the **github-issue-planner** agent with the issue number to:
   - Gather full context about the issue
   - Identify related issues and pull requests
   - Analyze codebase to create an implementation plan
   - Return a comprehensive, actionable plan

### Phase 2: TDD Implementation
Follow strict TDD methodology:

1. **Write Tests First**
   - Before implementing any feature, write failing tests
   - For frontend features: Use Playwright for E2E tests if available
   - For backend features: Write unit and integration tests
   - Commit tests: `git add . && git commit -m "test: add failing tests for [feature]"`

2. **Implement Incrementally**
   - Implement the minimum code to make tests pass
   - Run tests after each implementation step
   - Commit working code: `git add . && git commit -m "feat: implement [feature]"`
   - If tests fail, analyze and fix, or revert: `git reset --hard HEAD~1`

3. **Refactor**
   - Once tests pass, refactor for better code quality
   - Ensure tests still pass after refactoring
   - Commit refactoring: `git add . && git commit -m "refactor: improve [feature]"`

4. **E2E Testing**
   - MUST run end-to-end tests before considering the issue complete
   - If Playwright is available (check `package.json` or `playwright.config.ts`):
     - Use Playwright for comprehensive E2E testing
     - Test all user flows related to the feature
   - Otherwise, manually test the feature in development mode

### Phase 3: Success Verification

After implementation, clearly output:

```
✅ SUCCESS FLAG: [Feature Name]
- All tests passing: [Yes/No]
- E2E tests completed: [Yes/No]
- Commits made: [Number]
- Ready for review: [Yes/No]
```

OR if failed:

```
❌ FAILURE FLAG: [Feature Name]
- Issue encountered: [Description]
- Tests passing: [Yes/No]
- Last successful commit: [Hash]
- Recommended action: [Revert/Fix/Investigate]
```

### Phase 4: Issue Management
1. Use the Task tool to launch the **github-issue-manager** agent to:
   - If SUCCESS: Add success comment with test results and close the issue
   - If FAILURE: Add failure report with error details and apply failure label

## Important Guidelines

- **Commit Frequently**: Commit after each significant step (tests, implementation, refactoring)
- **Revertible**: Each commit should represent a stable checkpoint
- **Test Coverage**: Prioritize test coverage over feature completion
- **Playwright Priority**: Always use Playwright for E2E tests when available
- **Clear Flags**: Always output clear SUCCESS or FAILURE flags
- **No Partial Success**: An issue is only complete when ALL tests pass

## Usage

```bash
/solve-github-issue <issue-number>
```

Example:
```bash
/solve-github-issue 42
```

This will:
1. Plan the implementation for issue #42
2. Implement using TDD with frequent commits
3. Run E2E tests (Playwright if available)
4. Update the GitHub issue with results

## Final Phase Verification

After all work, output a concise completion check:

```
🔍 WORKFLOW VERIFICATION

✅ Phase 1: Planner executed → Plan created
✅ Phase 2: Tests written → Implementation done → Tests passing → E2E tested ([N] commits)
✅ Phase 3: SUCCESS/FAILURE flag documented
✅ Phase 4: GitHub issue updated

STATUS: ✅ COMPLETE | ⚠️ INCOMPLETE → Resume from Phase [N] | ❌ FAILED → [Action]
```

**Auto-recovery**: If any phase incomplete, immediately execute the missing step.
