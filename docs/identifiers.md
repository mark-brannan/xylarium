# Identifiers

A species id in this package is an **opaque slug**. It is minted once, from
the row label the Wood Handbook prints, and thereafter it is a name — not a
description, not a parseable structure, and not something to re-derive.

This is the rule the rest of the file exists to defend:

> **Never parse a species id. Never re-derive one. Look it up.**

## Why opaque, and not the binomial

The obvious alternative — key the data by scientific name — fails on the
Handbook's own table before taxonomy is even considered. Table 5-3b prints
four Douglas-fir rows, Coast, Interior West, Interior North and Interior
South. They are one binomial, *Pseudotsuga menziesii*, with four sets of
measured values distinguished by where the tree grew (footnote e). A
binomial key is not unique per row.

Taxonomy is the second reason. Binomials get revised by third parties on
their own schedule; the Handbook's row labels have been stable across the
1999, 2010 and 2021 editions. A key that a botanical revision can rename is
an identifier that moves, and moving an identifier breaks every consumer
that stored one.

The binomial's real virtues — searchability, cross-referencing other
datasets — are carried by the `scientific_name` field, which is data and may
be corrected, not an identifier, which may not.

## How an id was minted

Lowercase the Handbook's group heading and row label, join them heading
first, and replace every run of non-alphanumeric characters with a single
hyphen:

| Handbook row | id |
|---|---|
| Alder, red (no heading) | `alder-red` |
| Oak, white → Bur | `oak-white-bur` |
| Douglas-fir → Interior West | `douglas-fir-interior-west` |
| Hickory, true → Mockernut | `hickory-true-mockernut` |
| Cottonwood → Balsam, poplar | `cottonwood-balsam-poplar` |

Grouping the heading first is deliberate: it sorts the table's own families
together, so `oak-white-*` and `pine-*` are contiguous.

**That recipe is history, not a contract.** It records how the current ids
came to exist so a reader can check them against the table. It is not a
function a consumer may run — and in particular, a later edition that
renames a row does **not** get a re-minted id.

## What happens when the Handbook changes a row

- **A row is relabelled.** The id stays. `handbook_label` changes.
- **A row is split** (one row becomes two, as the Douglas-fir rows once
  were). The old id is retired and both new rows get new ids. The old id
  goes in `deprecated-identifiers.json` pointing at its successors.
- **A row is dropped.** The id is retired, never reused for anything else.

A retired id is never re-pointed at a different species. An id that once
meant a thing means that thing or nothing.

## The other names in the data

`group` (`hardwood` | `softwood`) and `origin` (`us` | `imported`) are
closed vocabularies, not identifiers: they are part of the published API,
and adding a member is a minor change while removing one is a breaking
change. `origin` is the Handbook's own split — Table 5-3 covers woods grown
in the United States, 5-4 and 5-5 cover imports.

Property field names carry their unit as a suffix (`_psi`,
`_million_psi`, `_in_lbf_per_in3`, `_in`, `_lbf`) because inch-pound is
canonical here: Table 5-3b is the primary table and the metric Table 5-3a
was converted from it (5-3a, footnote a). A consumer wanting SI converts.
The unit is in the name so that a value cannot be read out of this package
without its unit coming along.
