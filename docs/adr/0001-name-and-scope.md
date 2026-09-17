# ADR 0001 — Name and scope

- **Status:** accepted, 2026-09-15
- **Decision:** the package is named `xylarium`, unscoped, one package with
  datasets as files under `data/`, keyed by opaque species ids.

This is the design record written before the repository existed, landed here
verbatim from §1 onward. §1 is the name ruling, §2 the verified sources and
table numbers, §3 the schema and fixture design.

## 1. Name (IADA pass)

| element | layer | who moves if it changes |
|---|---|---|
| npm package name | Identifier | every lockfile and `dependencies` entry that holds it; deprecate-republish, forever |
| repo name | API | GitHub redirects; consumers' `repository.url` and links |
| dataset paths `data/<name>.json` | API | every consumer, but they can be told; deprecation path |
| species ids | Identifier | anyone storing a species in a BOM, cut list or fixture |
| property field names, units | API | schema as published |
| edition (FPL-GTR-282, 2021) | Data | this repo; `editions.json`, like colregs |

Inversions to refuse: edition or chapter in the package name; a unit system
in a species id; a Handbook table number in a field name.

**One package or several.** Chapters 4 and 5 are both keyed by species, so
they share one identifier space; splitting them means two packages minting
the same ids. Splitting later is an API removal plus a new identifier
(deprecation path, tolerable). Merging later is deprecating an identifier
(permanent). Start as one package with datasets as files under `data/`;
split only if a dataset ever gains a consumer set or source cadence of its
own.

**npm availability, checked 2026-09-15:** `wood` (logging lib, 0.0.0),
`lumber`, `timber`, `fpl` taken. `wood-handbook`, `wood-species`,
`woodwork`, `wood-data` free. No `mark-brannan/wood*` repo exists.

**Rejected: `wood-handbook`.** It names one instrument, and the package is
not one instrument: §2 plans PS 20-25 Table 3 and the PS 1-22 / PS 2-18
tables, which are NIST, not FPL-GTR-282. An instrument name would have been
false before the first transcription landed. `wood-data` and `wood-species`
were rejected for naming nothing and for excluding fasteners and sizes on
day one respectively.

**Ruled: `xylarium`, unscoped, repo `mark-brannan/xylarium`.**

A xylarium is an institutional reference collection of wood, indexed by
species. The FPL at Madison holds two — MADw (>103,000 specimens, the
largest in the world) and the Samuel J. Record collection, SJRw — in its
Center for Wood Anatomy Research, and FPL publishes a chapter titled
*Curating xylaria*. Same lab, same campus, same series as GTR-282. The word
names **the collection, not the instrument**, which is the boundary that
still holds when PS 20 arrives and NDS never does.

Register: `ampacity` names the quantity, `colregs` names the instrument,
`xylarium` names the collection. One word, a term of art, unscoped — the
siblings' pattern. Known cost: nil discoverability for a woodworker
searching "wood species data"; mitigate with `keywords` and the package
description, as `ampacity` does.

**npm and GitHub, checked 2026-09-15 (HTTP status on the registry / repo):**
free — `xylarium` 404, `xylotheque` 404, `scantling` 404, `janka` 404,
`boardfoot` 404, `mark-brannan/xylarium` 404. Taken — `tally`, `heartwood`,
`xylem`, `sawyer`, `cant`, `billet`, all 200.

Runner-up `scantling` was rejected on the licence boundary: scantling *rules*
are Lloyd's/ABS output and copyrighted, exactly what this package can never
contain, so the name would promise what the rights forbid.

**Out of scope, named so it stays decided:** abrasive grits (CAMI/FEPA) are
not wood — a separate identifier space and a separate licence question, a
separate package if ever.

Ruling: `xylarium`, Solace, 2026-09-15.

Rulings 2-4 taken as defaults, Claude, 2026-09-15 — toil, reversible by a
rename before first publish, and all three already argued above and in §3:
**one package** (ch. 4 and ch. 5 share the species identifier space; merging
later is a permanent deprecation, splitting later only an API removal);
**opaque species ids** minted from the Handbook row label, never parsed
(the Handbook's four Douglas-fir rows — Coast, Interior West, Interior
North, Interior South — are one binomial, so a binomial id is not even
unique per row, before taxonomic revision by a third party is considered;
the binomial's real virtues are carried as the `scientific_name` field);
**unscoped**, matching both siblings.

## 2. Datasets and sources

Subagent search, 2026-09-15. Table numbers verified by downloading the PDFs
and extracting text unless marked. 2010 (GTR-190) and 2021 (GTR-282) table
numbering is identical in ch. 4, 5, 6, 8; cite 2021.

Per-chapter PDFs: `https://www.fpl.fs.usda.gov/documnts/fplgtr/fplgtr282/chapter_NN_fpl_gtr282.pdf`
(whole book `fpl_gtr282.pdf`, ~104 MB). US Government work, 17 U.S.C. 105.

| dataset | source | table / equation |
|---|---|---|
| species mechanical, US | ch. 5 | **5-3b (inch-pound, primary)**, 5-3a (metric, converted from 5-3b per footnote a) |
| species mechanical, Canadian imports | ch. 5 | 5-4b / 5-4a |
| species mechanical, other imports | ch. 5 | 5-5b / 5-5a |
| elastic ratios, Poisson | ch. 5 | 5-1, 5-2 |
| property vs SG regressions | ch. 5 | 5-11a/b |
| shrinkage R/T/V, domestic | ch. 4 | 4-3 (green to oven-dry, % of green) |
| shrinkage, imported | ch. 4 | 4-4 |
| EMC vs T and RH | ch. 4 | 4-2 (grid: -1.1 to 115.6 C, RH 5 to 95 in 5 % steps) |
| EMC equation, Hailwood-Horrobin form | ch. 4 | eq. 4-5 with W, K, K1, K2 polynomials, C and F forms |
| green MC by species | ch. 4 | 4-1 |
| density from SG and MC | ch. 4 | 4-6a / 4-6b |
| lumber nominal vs dressed | ch. 6 | **6-6** (boards, dimension, timbers; dry and green); cross-check PS 20-25 **Table 3** |
| softwood commercial vs botanical names | ch. 6 | 6-7 |
| nail withdrawal | ch. 8 | eq. 8-1a/b (bright), 8-2 (threaded); sizes 8-1 to 8-3 |
| nail lateral | ch. 8 | eq. 8-3, coefficients 8-4; yield-theory Z 8-5, factors 8-6 |
| wood screw withdrawal, lateral | ch. 8 | eq. 8-10a/b; eq. 8-13 `p = K D^2`, K by group 8-9; sizes 8-8 |
| lag screw withdrawal, lateral | ch. 8 | eq. 8-14a/b; eq. 8-15, multipliers 8-10 to 8-12; Hankinson 8-16 |
| bolts | ch. 8 | bearing 8-13 to 8-15, Z 8-16, group factor eq. 8-19; design values deferred to NDS |

Facts that change the schema:

- **5-3b (inch-pound) is the primary table; 5-3a is converted from it.**
  So the canonical transcription is inch-pound, and the metric table is the
  independent oracle, not the other way round as first drafted.
- Side hardness is a column of 5-3, not a separate table; modified Janka;
  hickory values are from Bendtsen and Ethington 1975 (footnote d).
- SG basis: oven-dry weight, volume at the stated MC (green or 12 %).
  MOE is centre-loaded, span/depth 14, add 10 % to correct for shear
  (footnote c). Ch. 8 fastener equations use SG at 12 % MC; NDS uses
  oven-dry volume. Record the basis on every SG field.
- pypdf dropped equation bodies for 8-3, 8-4, 8-5, 8-16, 8-19: locations
  verified, forms only partly. Re-read from the PDF when transcribing.

**PS 20-25** (effective 2025-01, supersedes PS 20-20 Rev. 1): NIST,
<https://www.nist.gov/system/files/documents/2024/12/11/PS%2020-25%20Final.pdf>.
Table 3 dressed sizes; Table 1 finish/flooring; Table 2 siding; Table 4
worked lumber; Table 5 redwood green widths. No copyright notice in the
document; public-domain status is consistent but not stated, and ALSC
maintains it. Treat as cross-check for 6-6, not as a second source of truth,
until the rights are clearer.

**PS 1-22** (effective 2023-10-02) and **PS 2-18** (effective 2019-03-30):
NIST PDFs, no copyright notice. Public content: PS 1 Table 10 thickness by
Performance Category, Table 6 span ratings by construction, Tables 1-4
species groups and grades; PS 2 Table 1 thickness, Tables 2-8 performance
criteria. PS 1 table numbers came from the Aug 2023 final draft, unverified
against the Oct 2023 final.

**Copyrighted, excluded, not fetched:** AWC NDS Supplement (Fb, Ft, Fv, Fc,
E by species group and grade); APA Form E30 span tables and Form D510
Panel Design Specification.

## 3. Schema, first dataset: species mechanical properties

Style: ampacity's flat JSON with a `provenance` block and unit-suffixed
field names; colregs's `schema/*.schema.json` (draft 2020-12, `$id` under the
repo URL, `additionalProperties: false`) and `docs/identifiers.md`.

### Identifiers

- `species` id: an opaque slug minted once from the Handbook row label,
  e.g. `oak-white`, `douglas-fir-coast`, `pine-southern-loblolly`.
  Scientific name is a data field, not the id, because taxonomy revises
  binomials and the Handbook row labels have been stable across the 1999,
  2010 and 2021 editions. Documented in `docs/identifiers.md`: never
  re-derived, never parsed; a row that is renamed or split in a later
  edition gets a `deprecated-identifiers.json` entry, colregs-style.
- `group`: `hardwood` | `softwood` — closed vocabulary, API not identifier.
- `origin`: `us` | `imported` — the Handbook's own split (two tables).

### `data/species.json`

```json
{
  "provenance": {
    "instrument": "Wood Handbook: Wood as an Engineering Material, FPL-GTR-282 (2021)",
    "tables": ["5-3b", "5-4b", "5-5b"],
    "oracle_tables": ["5-3a", "5-4a", "5-5a"],
    "url": "https://www.fpl.fs.usda.gov/documnts/fplgtr/fplgtr282/chapter_05_fpl_gtr282.pdf",
    "rights": "US Government work, 17 U.S.C. 105",
    "transcribed": null
  },
  "units": {
    "specific_gravity": "oven-dry weight / volume at the stated MC (Table 5-3 footnote b)",
    "moisture": "green | 12 (percent MC)",
    "stress": "psi", "modulus": "million psi", "work": "in-lbf/in3", "impact": "in", "hardness": "lbf"
  },
  "species": {
    "oak-white": {
      "handbook_label": "Oak, white",
      "scientific_name": "Quercus alba",
      "group": "hardwood",
      "origin": "us",
      "properties": {
        "green": {
          "specific_gravity": 0.60,
          "modulus_of_rupture_psi": null,
          "modulus_of_elasticity_million_psi": null,
          "work_to_max_load_in_lbf_per_in3": null,
          "impact_bending_in": null,
          "compression_parallel_psi": null,
          "compression_perpendicular_psi": null,
          "shear_parallel_psi": null,
          "tension_perpendicular_psi": null,
          "side_hardness_lbf": null
        },
        "12": { "...same keys..." : null }
      }
    }
  }
}
```

Rules:
- Inch-pound is canonical (Table 5-3b, the primary per footnote a); field
  suffixes become `_psi`, `_million_psi`, `_in_lbf_per_in3`, `_in`, `_lbf`.
  The metric table (5-3a) is not transcribed as data; it is the fixture
  oracle (below). Consumers wanting SI convert, as wire-wright does for
  ampacity.
- `null` means the Handbook cell is blank (a dash); a missing key is a
  schema error. A footnoted value carries a sibling `<field>_note`.
- Values are copied to the Handbook's printed precision, never rounded or
  converted at transcription.
- Property keys are a closed list in the schema; adding one is additive
  (minor), removing one is major.

### Companion datasets, same shape

- `data/shrinkage.json` — ch. 4: radial, tangential, volumetric percent
  green to oven-dry, keyed by the same species ids.
- `data/emc.json` — ch. 4: EMC by temperature and RH, a 2-D grid like
  ampacity's ampacity-by-insulation table.
- `data/lumber-sizes.json` — ch. 6 / PS 20: nominal to dressed, dry and
  green, boards / dimension / timbers.
- `data/fasteners.json` — ch. 8: withdrawal and lateral-load equation
  coefficients, not tables of results.

### Fixtures, `fixtures/species-fixtures.json`

Three kinds, in the ampacity register (input, expected output, exact):

1. **Unit round-trip:** for ~20 species × both moisture states, the
   metric value from Table 5-3a. An implementation converting inch-pound
   to SI must land within the printed precision of 5-3a. This is
   the transcription check: a mis-keyed SI cell fails against the
   independently printed inch-pound cell.
2. **Lookup:** `{ species, moisture, property } -> value`, a dozen spot
   checks chosen across hardwood/softwood, us/imported, including one
   `null` cell.
3. **Derived:** specific gravity to density at 12% MC using the Handbook's
   own ch. 4 relation, so a consumer's density function is pinned.

`test/data.test.mjs` validates every data file against its schema with
ajv and runs the fixtures against a 20-line reference implementation,
as colregs does; the reference is a test, not an export.

## 4. Home

Repo `mark-brannan/xylarium`, created 2026-09-15. This file is its ADR 0001.

## What the build sessions have landed

`docs/identifiers.md`, `schema/species.schema.json`, and the three chapter 5
inch-pound species tables transcribed into `data/species.json` — 5-3b (113
US-grown), 5-4b (27 Canadian) and 5-5b (80 other imports), 220 rows. The
metric printings are fixture oracles per §3, not data:
`fixtures/species-fixtures.json` carries the round-trip and lookup fixtures
and records the 24 cells, and three row labels, where the Handbook's two
printings of a table disagree. The inch-pound printing is canonical there,
per §3.

Two things §3 did not anticipate. Tables 5-4 and 5-5 declare no derivation
between their printings, so the round-trip tolerance there allows both
printings' rounding rather than only the metric one's. And five Table 5-5b
rows print a 15% conditioned state instead of 12%, so `properties` carries
green plus whichever one state its row prints.

Not yet done, in the order §2 puts them: the chapter 4 datasets, chapter 6
lumber sizes, chapter 8 fasteners. Scientific names are filled only on 5-5b
rows, the only table of the three that prints a botanical name, and null on
its four lauan–meranti sub-rows, which print none. The derived
density fixture in §3 waits on the chapter 4 relation.
