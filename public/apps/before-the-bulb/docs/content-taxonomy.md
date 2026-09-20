# Before the Bulb content taxonomy

Use this taxonomy before adding new entries. The goal is balanced coverage of things children recognize, not a longer list of gadgets.

## Core domains

- **Food and drink:** ingredients, snacks, packaged foods, restaurant formats, kitchen tools, storage, serving, and preservation.
- **Home and cleaning:** furniture, plumbing, heating, cooling, laundry, cleaning products, lighting, and household appliances.
- **School and making:** writing, drawing, paper, binding, cutting, measuring, craft materials, and classroom furniture.
- **Play and toys:** physical toys, board games, playground equipment, sports gear, pretend play, and construction toys.
- **Clothing and personal care:** fasteners, shoes, uniforms, hygiene, cosmetics, sun protection, and weather gear.
- **Health and medicine:** diagnosis, first aid, medicines, vaccines, dental care, mobility aids, and emergency services.
- **Transport and places:** roads, signs, public transit, vehicles, parking, elevators, airports, and space travel.
- **Communication and media:** writing, mail, telephone, radio, recorded sound, television, photography, internet, and messaging.
- **Work and shopping:** money, stores, packaging, barcodes, vending, offices, printing, copying, and measurement.
- **Music and performance:** instruments, playback, amplification, recording, headphones, and stage equipment.

## Surprise lenses

For every domain, look for both directions:

1. **Feels ancient, but the familiar form is recent** — toothpaste, sliced bread, plastic bottles, TV remotes, disposable diapers.
2. **Feels modern, but has deep roots** — popcorn, soap, hot chocolate, yo-yos, umbrellas, games, and sunglasses.
3. **Old idea, new material** — paper to plastic, icebox to refrigerator, chalk to marker, wire to Wi-Fi.
4. **Old object, new habit** — cacao to hot chocolate, tea to tea bags, bread to packaged sliced bread, music to personal headphones.
5. **Prototype versus everyday version** — submarine, helicopter, computer, solar panel, electric car, 3D printer.
6. **Brand or product format versus invention** — Coca-Cola, Fanta, Play-Doh, Popsicle, Monopoly, Pokémon, and Band-Aid.
7. **Infrastructure children see but rarely question** — traffic lights, stop signs, elevators, subway systems, parking meters, vending machines, and shopping carts.

## Research workflow

For each domain, generate candidates from museum “everyday objects” collections, children’s museum toy histories, library education pages, manufacturer timelines, and discussion forums such as Reddit. Treat forums as idea generators only. Verify dates with a primary source, museum, library, university, or authoritative company history.

Record three dates when they differ:

- the earliest known ancestor;
- the recognizable modern form;
- the moment it became common or commercially available.

Use the recognizable modern form for the quiz when the earlier ancestor would mislead children. Put the distinction in `ambiguityNotes` and the fun explanation.

## Coverage checklist

Before declaring a content pass complete, check that every domain has at least one entry in each applicable surprise lens, that food, home, school, play, clothing, health, transport, communication, shopping, and music are all represented, and that no category is dominated by technology brands.

## Matching rule

The current comparisons remain editorially curated. For future expansion, candidate generation should call `comparisonScore`, `isFunComparison`, and `buildFunComparisonCandidates` in `src/game.mjs`. Same-category matches score highest, explicit shared `comparisonTags` are strongest, and deliberately related category pairs such as games and characters, food and drinks, or transport and navigation are preferred. Cross-category contrasts are still allowed when their dates are reasonably close; the allowed window grows for pairs whose newer object is itself historical, reflecting the fuzzier dates and broader curiosity value of ancient things. This supports surprising prompts such as a rocket versus a Rubik’s Cube and an ancient paper form versus an ancient umbrella, while filtering an ancient object versus a modern laptop. Editors still add the kid-facing fact and sources before a candidate enters the playable pool.

The current pool is strong in inventions, branded media, food, and household technology. The next audit should prioritize clothing and weather gear, medicine and first aid, public infrastructure, music instruments and playback, shopping routines, and everyday objects with ancient ancestors but recent familiar forms.
