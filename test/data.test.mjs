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
// Every row prints green plus exactly one conditioned state. Most print 12%;
// five Table 5-5b rows print 15% instead.
const CONDITIONED = ['12', '15']

// Rows per transcribed table. A transcription that gained or lost a row is a
// transcription that needs looking at, not a test to relax.
const ROW_COUNT = { '5-3b': 113, '5-4b': 27, '5-5b': 80 }

test('data/species.json validates against schema/species.schema.json', () => {
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(schema)
  const ok = validate(data)
  assert.ok(ok, ajv.errorsText(validate.errors, { separator: '\n' }))
})

test('every row of every transcribed table is present', () => {
  const counted = {}
  for (const s of Object.values(data.species)) {
    counted[s.table] = (counted[s.table] ?? 0) + 1
  }
  assert.deepEqual(counted, ROW_COUNT)
})

test('every species carries every property in both moisture states', () => {
  for (const [id, s] of Object.entries(data.species)) {
    // Compared as a set: "12" is an array-index-like key, so V8 orders it
    // ahead of "green" on parse whatever the file says.
    const states = Object.keys(s.properties).sort()
    assert.equal(states.length, 2, `${id}: moisture states`)
    assert.ok(states.includes('green'), `${id}: no green state`)
    const conditioned = states.find((k) => k !== 'green')
    assert.ok(
      CONDITIONED.includes(conditioned),
      `${id}: unexpected moisture state ${conditioned}`,
    )
    for (const mc of ['green', conditioned]) {
      for (const p of PROPERTIES) {
        // A missing key is a schema error; a null is the Handbook's own dash.
        assert.ok(p in s.properties[mc], `${id}/${mc}: missing ${p}`)
      }
    }
  }
})

// A label is unique only within its table: Table 5-3b and Table 5-4b both
// print an "Aspen, Quaking" row, and they are different measurements of
// different trees.
test('species ids are opaque slugs and handbook labels are unique per table', () => {
  const labels = new Set()
  for (const [id, s] of Object.entries(data.species)) {
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${id}: not a slug`)
    const key = `${s.table}|${s.handbook_label}`
    assert.ok(!labels.has(key), `duplicate label: ${key}`)
    labels.add(key)
  }
})

// Origin is the Handbook's own split: Table 5-3 covers woods grown in the
// United States, 5-4 and 5-5 cover imports.
test('origin follows the table the row came from', () => {
  const expected = { '5-3b': 'us', '5-4b': 'imported', '5-5b': 'imported' }
  for (const [id, s] of Object.entries(data.species)) {
    assert.equal(s.origin, expected[s.table], `${id}: origin`)
  }
})

// Table 5-5 prints no hardwood/softwood split and Tables 5-3 and 5-4 print no
// binomials. Null here is the table's silence, not a gap to fill in from
// memory.
test('group and scientific_name are present exactly where the table prints them', () => {
  for (const [id, s] of Object.entries(data.species)) {
    if (s.table === '5-5b') {
      assert.equal(s.group, null, `${id}: Table 5-5 prints no group`)
      assert.ok('sample_origin' in s, `${id}: Table 5-5b prints a sample origin`)
      assert.match(s.sample_origin, /^(AF|AM|AS)$/, `${id}: sample_origin`)
    } else {
      assert.ok(['hardwood', 'softwood'].includes(s.group), `${id}: group`)
      assert.equal(s.scientific_name, null, `${id}: ${s.table} prints no binomial`)
      assert.ok(!('sample_origin' in s), `${id}: ${s.table} prints no sample origin`)
    }
  }
})

// The transcription check. What this package carries is the inch-pound
// printing of each table; the Handbook prints the same rows again in metric.
// Converting a transcribed cell must land on what the metric table prints,
// within the two printings' combined rounding — and a mis-keyed digit will not.
test('round-trip: converting a transcribed cell lands on the metric printing', () => {
  let checked = 0
  for (const c of fixtures.round_trip) {
    const s = data.species[c.species]
    assert.ok(s, `unknown species in fixture: ${c.species}`)
    const oracle = fixtures.conversion.table_oracle[s.table]
    const conv = fixtures.conversion.by_table[oracle]
    assert.deepEqual(
      Object.keys(c.metric).sort(),
      Object.values(conv).map((v) => v.metric_property).sort(),
      `${c.species}/${c.moisture}: fixture does not cover ${oracle}'s columns`,
    )
    for (const [prop, { metric_property, factor, tolerance }] of Object.entries(conv)) {
      const ip = s.properties[c.moisture][prop]
      const si = c.metric[metric_property]
      assert.equal(
        ip === null, si === null,
        `${c.species}/${c.moisture}/${prop}: ${s.table} ${ip} but ${oracle} ${si}`,
      )
      if (ip === null) continue
      const delta = Math.abs(ip * factor - si)
      assert.ok(
        delta <= tolerance,
        `${c.species}/${c.moisture}/${prop}: ${ip} -> ${(ip * factor).toFixed(1)}, ` +
          `${oracle} prints ${si} (off by ${delta.toFixed(1)}, tolerance ${tolerance})`,
      )
      checked++
    }
  }
  assert.ok(checked > 750, `only ${checked} cells round-tripped`)
})

test('lookup: spot checks against the printed table', () => {
  for (const c of fixtures.lookup) {
    const s = data.species[c.species]
    if (c.absent) {
      assert.equal(s, undefined, `${c.species} should not be in any transcribed table`)
      continue
    }
    assert.ok(s, `unknown species in fixture: ${c.species}`)
    assert.equal(
      s.properties[c.moisture][c.property], c.value,
      `${c.species}/${c.moisture}/${c.property}`,
    )
  }
})

// Where the Handbook's own two printings of a table disagree, the inch-pound
// printing wins and the disagreement is recorded rather than reconciled. This
// pins that record to the data: if a future edit "fixes" one of these cells
// towards the metric printing, the fixture stops describing the file and this
// fails.
test('recorded disagreements still describe the data', () => {
  const cells = fixtures.handbook_internal_disagreements.cells
  assert.ok(cells.length > 0)
  for (const c of cells) {
    const s = data.species[c.species]
    assert.ok(s, `unknown species in disagreement list: ${c.species}`)
    assert.equal(s.table, c.canonical_table, `${c.species}: table`)
    assert.equal(
      s.properties[c.moisture][c.property], c.canonical,
      `${c.species}/${c.moisture}/${c.property}: data no longer matches the ` +
        `recorded ${c.canonical_table} value`,
    )
  }
})

// The labels the two printings spell differently. handbook_label carries the
// inch-pound spelling; this keeps the metric spelling findable rather than
// quietly reconciled away.
test('recorded label disagreements still describe the data', () => {
  for (const c of fixtures.handbook_internal_disagreements.labels) {
    const s = data.species[c.species]
    assert.ok(s, `unknown species in label disagreement list: ${c.species}`)
    const printed = c[`table_${s.table.replace('-', '_')}`]
    assert.ok(
      s.handbook_label === printed || s.handbook_label.endsWith(`, ${printed}`),
      `${c.species}: handbook_label ${s.handbook_label} is not ${printed}`,
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
