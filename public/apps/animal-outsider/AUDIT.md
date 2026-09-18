# Animal Outsider Audit

Date: 2026-09-17

## Scope

Structural and runtime audit of all 298 pool entries. This is not a complete scientific review of every name, classification, etymology, or trait.

## Corrections

- Restored Amniota in marsupial and monotreme paths, using the shared mammal path.
- Included Laurasiatheria consistently for carnivores and both hoofed-mammal orders.
- Included Hominoidea for the great apes and Tethytheria for the elephant.
- Restored missing family steps for centipede, millipede, starfish, and sea urchin.
- Removed the default difficulty calculation that assigned ordinary valid trios to expert-only levels and then rejected them.
- Enabled wrapping for long names and constrained grid children on narrow screens.

Classification references: [NCBI chimpanzee lineage](https://ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=9598), [NCBI Canidae lineage](https://ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?command=show&id=9611&lvl=3&mode=tree), and [Nomenclature and placental mammal phylogeny](https://pmc.ncbi.nlm.nih.gov/articles/PMC2865478/).

## Repeatable Checks

Run `node scripts/audit-animal-outsider.mjs` from the workspace root.

The audit checks unique IDs, common names and scientific names; complete ranked taxonomy; ordered and consistent clade paths; saved-example membership; all explorer entries; randomized-example membership and uniqueness; representative new-animal trios; and 500 seeded rounds covering answer locking, reveal/reset, nearby outsiders, unique closest pairs, recent-repeat prevention, and duplicate-answer protection.

## Remaining Content Gaps

- 530 distinct branch names lack curated introductions. Their current fallback supplies examples and usually an inferred rank, but its name-origin and trait text are placeholders. Unranked clades can be labeled only "Branch".
- Species introductions also use generic placeholder origin and trait text.
- Some curated "Typical traits" entries merely list members. A populated field is not proof of a useful explanation.
- Mule is a hybrid but the current species renderer labels every entry "Species".
- Broad names such as Bear, Fish, and Parrot in the supplied lists refer to groups; pool entries represent particular species. Common-name coverage does not establish complete coverage of those groups.
- The pool is a simplified classification tree. Consistent paths do not prove that all intermediate evolutionary relationships are represented.

These content gaps are reported separately from structural test failures so passing tests cannot be mistaken for complete factual validation.
