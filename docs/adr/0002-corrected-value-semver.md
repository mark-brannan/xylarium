# ADR 0002 — A corrected transcribed value is a patch

- **Status:** accepted, 2026-09-15
- **Decision:** changing a value in `data/` because it was transcribed wrong
  is a **patch**. The guard is process, not the version number: the change
  cites the table and row it was re-read from, and lands a `### Corrected`
  changelog entry naming species id, field, old value, new value, and which
  printing settled it.

`AGENTS.md` versions the shape of the schema — adding a property key is
minor, removing one breaking; adding a member to `group` or `origin` is
minor, removing one breaking. It says nothing about the values, which are
the entire product. This settles that one case.

## What counts as a correction

A cell in `data/` that is not what the canonical table prints. The Handbook
did not change; the transcription was wrong — a digit mis-keyed, a baseline
bucketed to the wrong row, a dash read as a number.

Three things that look similar and are not corrections:

- **A dash stays `null`.** A cell the Handbook does not print is not a
  missing value waiting to be found.
- **Reconciling 5-3b against 5-3a is forbidden.** Table 5-3b is canonical,
  5-3a is the oracle, and the 21 cells where the two printings disagree
  beyond rounding are recorded in the fixtures, not resolved. Moving a data
  value to match 5-3a corrects the Forest Products Laboratory, which is not
  this package's job.
- **A field filled for the first time from a newly cited source** — the
  `null` scientific names — is added data, not a correction: `feat`.

## Why patch

The published contract is that a number here is the cell of a named table in
a named edition, at the printed precision. A wrong digit was never part of
that promise, so correcting it moves the data toward the contract instead of
changing the contract. Semver ranks what happened to the contract, and here
nothing happened to it.

The cost is real and worth stating: under `~` or `^`, a consumer who caches
values will see one change without being asked. The answer to that is the
changelog entry, not the version number.

## Rejected: correction as minor

Weighed, on the argument that a consumer caching values sees silent drift
under `~`. Rejected on three grounds.

**It does not buy the protection it offers.** `~0.1.0` admits patches;
`^1.2.0` admits minors. A consumer who caches values and cannot tolerate one
moving is protected by an exact pin and by reading the changelog, and both of
those work the same whichever way this is ruled. Minor moves the drift from
one range operator to the other; it does not stop it.

**It empties the patch level.** This package is data, with no runtime code
and no behaviour to fix. If every value change is minor, patch carries
prose edits and nothing else, and a patch release stops meaning anything a
consumer can act on.

**It hides the correction it means to announce.** A version bump has one bit
of information in it and cannot say which species, which field, or which
printing settled the argument. Ranking corrections as minor invites a reader
to treat the number as sufficient notice, when the changelog entry is the
only thing that ever was.

## The process guard

Every commit that changes a value in `data/`:

1. **Cites the table and the row** in the commit body — edition, table
   number, and the Handbook row label the value was re-read from.
2. **Re-reads positionally from the chapter PDF**, per `AGENTS.md`. A value
   corrected from memory, from a conversion, or from another package is not
   a transcription and does not land.
3. **Passes the oracle.** `npm test` converts the cell and checks it against
   the metric printing; a mis-keyed digit fails there.
4. **Lands a changelog entry** under `### Corrected`:

   > `oak-white-bur` · `properties.12.side_hardness_lbf` · 1360 → 1370 ·
   > re-read from FPL-GTR-282 Table 5-3b, row "Oak, white → Bur"; confirmed
   > against Table 5-3a.

5. **Updates the fixtures in the same commit** wherever the corrected cell
   appears in one, `handbook_internal_disagreements` included.

The commit type is `correct`, mapped to the `Corrected` section in
`release-please-config.json`. release-please's default versioning strategy
bumps patch for any type that is neither breaking nor `feat`, so the type
and the ruling agree without further configuration.

## Before 1.0

`bump-minor-pre-major` with `bump-patch-for-minor-pre-major` collapses `feat`
to patch as well, so while the version is `0.x` a correction and an added
dataset are indistinguishable from the version alone. That is the argument
for the guard being process: for the whole of `0.x`, the changelog entry is
the only signal a consumer has, and it has to be right from the first
correction rather than from 1.0.

## Not settled here

A **new edition of the Wood Handbook** changes values with nothing
mis-transcribed. It is a different question — a different `provenance`
block, possibly different rows — and this ADR does not answer it.

Ruling: patch, with the process guard above, Solace, 2026-09-15.

Taken as defaults, Claude, 2026-09-15 — toil, reversible before the first
release: the `correct` commit type and its `Corrected` section name; the
five-part changelog entry format; and the three exclusions above, each of
which restates a rule `AGENTS.md` already carries.
