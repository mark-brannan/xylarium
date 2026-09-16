# Working conventions — xylarium

This package is **data**. It ships JSON, a schema, and fixtures. It exports
no code and has no runtime dependencies. Keep it that way.

## The one rule

**Every value in `data/` is a cell of a named table in a named edition of the
Wood Handbook, copied at the printed precision.**

Not rounded. Not converted. Not unit-normalised. Not recalled. If you cannot
point at the table and the row, the value does not go in the file. This is
the whole reason the package is worth depending on.

Inch-pound is canonical: Table 5-3b is the primary table and the metric
5-3a was converted from it (5-3a footnote a). Transcribe 5-3b; use 5-3a as
the oracle.

## Transcribing a table

1. Fetch the chapter PDF from
   `https://www.fpl.fs.usda.gov/documnts/fplgtr/fplgtr282/chapter_NN_fpl_gtr282.pdf`.
   Leave it in the scratchpad; it is not committed.
2. Extract **positionally**, not from flowed text. Indentation is what
   distinguishes a group heading from a species row, and flowed extraction
   both loses it and injects spaces into numbers (`1. 57`, `1,58 0`).
   Superscript footnote markers lift their word's box, so bucket lines by
   baseline with a tolerance.
3. Check every cell against a second printing of the same data before
   believing any of it. For chapter 5 that is the metric table; for
   chapter 6 it is PS 20-25 Table 3. Extraction that looks right is not
   the same as extraction that is right.
4. Where two printings of the Handbook disagree, **record the
   disagreement; do not reconcile it.** The canonical table wins in the
   data, and the discrepancy goes in the fixtures with both values. A test
   pins that list to the data so neither drifts.

## Identifiers

`docs/identifiers.md` governs, and it is not advisory. Species ids are
opaque: minted once, never parsed, never re-derived, never re-pointed. The
minting recipe in that file is history, not a function to run.

## Adding a dataset

One file under `data/`, one schema under `schema/`, fixtures under
`fixtures/`, and a `provenance` block in the data file itself naming the
instrument, chapter, tables, URL, rights and transcription date. A consumer
holding the data file alone must be able to say where it came from.

Adding a property key is a minor change; removing one is breaking. Adding a
member to `group` or `origin` is minor; removing one is breaking.

## Scope

The Handbook and the NIST voluntary product standards are in scope. The AWC
NDS supplement and the APA span tables are copyrighted and are permanently
out of scope — see `docs/adr/0001-name-and-scope.md` §2. So are abrasive
grits, which are not wood.

## Verification

`npm ci && npm test`. That is the whole verification surface, and CI gates
on it plus the shared prose-budget workflow.
