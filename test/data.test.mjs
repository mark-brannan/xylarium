import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
// draft 2020-12 needs ajv's 2020 entry point; the default export is draft-07.
import Ajv from 'ajv/dist/2020.js'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const data = read('../data/species.json')
const schema = read('../schema/species.schema.json')
const fixtures = read('../fixtures/species-fixtures.json')

// The property keys are a cross-language contract. A port in another language
// reads these names, so losing one is a breaking change rather than a tidy-up.
// Spelling them out here — rather than iterating whatever the file happens to
// contain — is the point: a test that walks the data's own keys passes just as
// happily after a column has been dropped.
const PROPERTIES = [
  'specific_gravity',
  'modulus_of_rupture_psi',
  'modulus_of_elasticity_million_psi',
  'work_to_max_load_in_lbf_per_in3',
  'impact_bending_in',
  'compression_parallel_psi',
  'compression_perpendicular_psi',
  'shear_parallel_psi',
  'tension_perpendicular_psi',
  'side_hardness_lbf',
]
const MOISTURE = ['green', '12']

// Table 5-3b prints 113 rows of US-grown species. A transcription that gained
// or lost a row is a transcription that needs looking at, not a test to relax.
const ROW_COUNT = 113

test('data/species.json validates against schema/species.schema.json', () => {
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(schema)
  const ok = validate(data)
  assert.ok(ok, ajv.errorsText(validate.errors, { separator: '\n' }))
})

test('every row of Table 5-3b is present', () => {
  assert.equal(Object.keys(data.species).length, ROW_COUNT)
})

test('every species carries every property in both moisture states', () => {
  for (const [id, s] of Object.entries(data.species)) {
    // Compared as a set: "12" is an array-index-like key, so V8 orders it
    // ahead of "green" on parse whatever the file says.
    assert.deepEqual(
      Object.keys(s.properties).sort(), [...MOISTURE].sort(), `${id}: moisture states`,
    )
    for (const mc of MOISTURE) {
      for (const p of PROPERTIES) {
        // A missing key is a schema error; a null is the Handbook's own dash.
        assert.ok(p in s.properties[mc], `${id}/${mc}: missing ${p}`)
      }
    }
  }
})

test('species ids are opaque slugs and handbook labels are unique', () => {
  const labels = new Set()
  for (const [id, s] of Object.entries(data.species)) {
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${id}: not a slug`)
    assert.ok(!labels.has(s.handbook_label), `duplicate label: ${s.handbook_label}`)
    labels.add(s.handbook_label)
  }
})

test('Table 5-3 covers US-grown species only', () => {
  for (const [id, s] of Object.entries(data.species)) {
    assert.equal(s.origin, 'us', `${id}: origin`)
  }
})

// The transcription check. Table 5-3b (inch-pound) is what this package
// carries; Table 5-3a is the same data printed in SI, converted from 5-3b per
// its own footnote a. Converting a transcribed cell must therefore land within
// 5-3a's printed rounding — and a mis-keyed digit will not.
test('round-trip: converting 5-3b lands on what 5-3a prints', () => {
  const conv = fixtures.conversion.by_property
  let checked = 0
  for (const c of fixtures.round_trip) {
    const s = data.species[c.species]
    assert.ok(s, `unknown species in fixture: ${c.species}`)
    for (const [prop, { metric_property, factor, tolerance }] of Object.entries(conv)) {
      const ip = s.properties[c.moisture][prop]
      const si = c.metric[metric_property]
      assert.equal(
        ip === null, si === null,
        `${c.species}/${c.moisture}/${prop}: 5-3b ${ip} but 5-3a ${si}`,
      )
      if (ip === null) continue
      const delta = Math.abs(ip * factor - si)
      assert.ok(
        delta <= tolerance,
        `${c.species}/${c.moisture}/${prop}: ${ip} -> ${(ip * factor).toFixed(1)}, ` +
          `5-3a prints ${si} (off by ${delta.toFixed(1)}, tolerance ${tolerance})`,
      )
      checked++
    }
  }
  assert.ok(checked > 300, `only ${checked} cells round-tripped`)
})

test('lookup: spot checks against the printed table', () => {
  for (const c of fixtures.lookup) {
    const s = data.species[c.species]
    if (c.absent) {
      assert.equal(s, undefined, `${c.species} should not be in Table 5-3b`)
      continue
    }
    assert.ok(s, `unknown species in fixture: ${c.species}`)
    assert.equal(
      s.properties[c.moisture][c.property], c.value,
      `${c.species}/${c.moisture}/${c.property}`,
    )
  }
})

// Where the Handbook's own two tables disagree, 5-3b wins and the
// disagreement is recorded rather than reconciled. This pins that record to
// the data: if a future edit "fixes" one of these cells towards 5-3a, the
// fixture stops describing the file and this fails.
test('recorded disagreements still describe the data', () => {
  const cells = fixtures.handbook_internal_disagreements.cells
  assert.ok(cells.length > 0)
  for (const c of cells) {
    const s = data.species[c.species]
    assert.ok(s, `unknown species in disagreement list: ${c.species}`)
    assert.equal(
      s.properties[c.moisture][c.property], c.table_5_3b,
      `${c.species}/${c.moisture}/${c.property}: data no longer matches the recorded 5-3b value`,
    )
  }
})

test('no round-trip fixture covers a cell the two tables disagree on', () => {
  const bad = new Set(
    fixtures.handbook_internal_disagreements.cells.map((c) => `${c.species}/${c.moisture}`),
  )
  for (const c of fixtures.round_trip) {
    assert.ok(
      !bad.has(`${c.species}/${c.moisture}`),
      `${c.species}/${c.moisture} is in both round_trip and the disagreement list`,
    )
  }
})
