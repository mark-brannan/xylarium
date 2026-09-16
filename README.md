# xylarium

Wood species mechanical properties from the **Wood Handbook: Wood as an
Engineering Material** (USDA Forest Products Laboratory, FPL-GTR-282, 2021),
as language-neutral JSON — with a JSON Schema, and fixtures any
implementation in any language can be checked against.

A xylarium is an institutional reference collection of wood, indexed by
species. The FPL at Madison keeps two of them. This is the data shaped like
one: a collection, not an instrument.

```bash
npm install xylarium
```

```js
import species from 'xylarium/data/species.json' with { type: 'json' }

const oak = species.species['oak-white-white']
oak.handbook_label                                  // 'Oak, white, White'
oak.properties['12'].side_hardness_lbf              // 1360
oak.properties['12'].modulus_of_rupture_psi         // 15200
oak.properties.green.specific_gravity               // 0.6
```

No runtime dependencies. No code — the package is data, a schema, and the
fixtures that pin them.

## What is in it

`data/species.json` — **Table 5-3b**, chapter 5: 113 species grown in the
United States, each in two moisture states (`green` and `12`), each with ten
properties:

| field | what it is |
|---|---|
| `specific_gravity` | ovendry weight, volume at the stated moisture content |
| `modulus_of_rupture_psi` | static bending strength |
| `modulus_of_elasticity_million_psi` | centre-loaded, span/depth 14; add 10% for shear |
| `work_to_max_load_in_lbf_per_in3` | energy absorbed in bending |
| `impact_bending_in` | drop height causing complete failure, 50-lb hammer |
| `compression_parallel_psi` | maximum crushing strength |
| `compression_perpendicular_psi` | fibre stress at proportional limit |
| `shear_parallel_psi` | maximum shearing strength |
| `tension_perpendicular_psi` | maximum tensile strength |
| `side_hardness_lbf` | modified Janka, load perpendicular to grain |

A `null` is the Handbook's own dash — a cell it does not print. A missing
key is a bug. Every field name carries its unit, because a number that
leaves this package without its unit is a hazard.

## Read this before you use the numbers

**These are clear-wood test averages, not design values.** They come from
small, straight-grained, defect-free specimens. Real lumber has knots,
slope of grain, checks and a grade. Structural design uses the allowable
values in the AWC National Design Specification, which are derived from
data like this but are not this data, and which this package does not and
cannot contain.

Use these for comparing species, for woodworking, for teaching, for
estimating. Do not size a beam with them.

## Why inch-pound

Table 5-3b is the primary table. The metric Table 5-3a was converted from
it — 5-3a's own footnote a says so. So inch-pound is what this package
transcribes, at the Handbook's printed precision, and 5-3a is used as an
independent oracle rather than as a second source: converting a transcribed
5-3b cell must land within 5-3a's printed rounding, and a mis-keyed digit
will not. `npm test` runs that check over 400 cells.

Consumers wanting SI convert. The factors are in
`fixtures/species-fixtures.json` under `conversion`.

### Where the Handbook disagrees with itself

In 21 of the 2,125 cells the two tables are not a rounding of each other —
5-3a prints rock elm's side hardness as a dash where 5-3b prints 940 lbf;
western white pine's specific gravities are 0.36/0.35 in 5-3a and 0.35/0.38
in 5-3b. **5-3b wins**, because 5-3a was derived from it. The disagreements
are listed in full under `handbook_internal_disagreements` in the fixtures
file, and a test pins that list to the data so neither can drift from the
other.

They are recorded, not reconciled. Correcting the Forest Products
Laboratory is not this package's job.

## Species ids

`oak-white-bur`, `douglas-fir-interior-west`, `hickory-true-mockernut` —
opaque slugs, minted once from the Handbook's row labels.

**Never parse one. Never re-derive one. Look it up.** The binomial is a
data field (`scientific_name`), not the key, because taxonomy revises
binomials and because the Handbook's four Douglas-fir rows are one binomial
with four sets of measured values. `docs/identifiers.md` has the full
argument and the rules for what happens when a row is renamed or split.

Scientific names are `null` today: Table 5-3 prints none, and they will be
filled from a cited source rather than from anyone's memory.

## Verification

```bash
npm ci && npm test
```

- every data file validates against its schema (`schema/`, draft 2020-12,
  `additionalProperties: false`);
- all 113 rows present, every property key in both moisture states;
- the round-trip oracle above;
- spot-check lookups against the printed table, including a cell that is a
  dash and a species that is deliberately absent.

`fixtures/species-fixtures.json` is the cross-implementation contract: a
port in any language must reproduce those outputs exactly.

## Provenance and rights

The Wood Handbook is a work of the United States Government, not subject to
copyright in the United States (17 U.S.C. 105). `data/species.json` carries
the chapter, the table numbers, the source URL and the transcription date in
its own `provenance` block, so a consumer holding the data alone can still
say where it came from.

The AWC National Design Specification supplement and the APA span tables are
copyrighted. They are out of scope here and always will be — see
`docs/adr/0001-name-and-scope.md` §2.

## Not yet transcribed

Tables 5-4b and 5-5b (Canadian and other imports), chapter 4 shrinkage and
equilibrium moisture content, chapter 6 nominal-to-dressed lumber sizes, and
the chapter 8 fastener equations. The plan for each, with table numbers
already verified against the PDFs, is in `docs/adr/0001-name-and-scope.md`
§2.

## Licence

Apache-2.0 for the packaging, schema, fixtures and prose. The Handbook data
itself is a US Government work and carries no copyright.
