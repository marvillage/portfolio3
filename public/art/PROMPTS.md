# Art drop zone

Drop generated images here and the site picks them up automatically on the next
build or dev reload. Every image is optional; the site has built-in SVG line art
until a file exists.

## Shared style (paste at the start of every prompt)

> Black and white comic book ink illustration, pure monochrome, no colour at all.
> Bold confident black outlines, cross-hatching and halftone dot shading, high
> contrast, clean vector-like edges. Space opera mood, original design, no logos,
> no text, no letters, no watermarks, no recognisable franchise characters or ships.

Always ask for **no text** in the image. The site adds its own lettering.

## Files

| File | Size | What to draw |
|---|---|---|
| `hero-ship.png` | 1600 × 1000, **transparent PNG** | A sleek starfighter banking toward the viewer, three-quarter view, slight upward tilt, engines leaving two thin ink speed streaks behind it. White ink lines and white highlights on a transparent background (it sits on a near-black page), black fills on the hull. Compact silhouette, no background stars. |
| `pilot-portrait.png` | 800 × 1000, black background | Head-and-shoulders comic portrait of a young Indian man as a space pilot: flight jacket with collar, helmet tucked under one arm or visor pushed up, calm half-smile, drawn with white ink on black with halftone shading. Use your own photo as the reference image if the tool supports it. |
| `og-cover.png` | 1200 × 630, black background | Wide scene: a line-art spherical space station (lattice sphere with one concave dish and an equatorial trench) upper right, the same starfighter from `hero-ship.png` lower left, scattered white star dots. White ink on black. No text. Used as the link-preview image once added. |
| `projects/<slug>.png` | 1200 × 675 (16:9), black background | One scene per project, see list below. White ink on black, halftone shading, no text. |

### Project thumbnails

Name the file after the project slug. The slug is the project title before the
dash, lower-cased, with spaces turned into hyphens.

| Slug | Scene idea |
|---|---|
| `zentro.png` | A space-station control deck with many small docking bays, each bay holding a different tiny ship: multi-tenant, one hub. |
| `civicfix.png` | A city skyline seen from orbit with a tractor beam from a small repair ship fixing a broken street light. |
| `agriguard.png` | Terraced farm fields under a glass dome on a moon, with a small irrigation drone and a weather satellite overhead. |
| `athleteinsight.png` | An astronaut runner on a zero-gravity track with a holographic heart-rate line trailing behind. |
| `call-insight.png` | A deep-space listening dish catching sound waves drawn as comic speech bubbles. |
| `e-waste-management-g-tron.png` | A salvage ship towing a net of broken circuit boards and old satellites toward a recycling station. |
| `mindrelic.png` | A floating crystalline vault with memory orbs inside, a cable plugging into a pilot helmet. |
| `dendrite-ai.png` | Two astronauts sketching on a shared glass whiteboard in a cockpit, the sketch coming to life as a wireframe. |
| `devrishi-2-0.png` | An ancient scroll unrolling inside a spaceship med-bay, herbs and planets drawn in the margins. |
| `college-predictor.png` | A star chart with a navigation computer plotting a course between labelled planets drawn as university domes. |

Any project without a file simply shows no thumbnail. You can also point a project
at a specific file with the `image` field in `data/projects.ts`.

## Optional section art

None of these are required. Each appears only when the file exists.

| File | Size | Where it shows | What to draw |
|---|---|---|---|
| `patches/aecad-ai.png` | 800 × 800, black or transparent | Round badge on the AECAD.ai experience card | Circular mission patch: a wireframe 3D building and a drafting compass inside a ring border, no text. |
| `patches/beehyv-software-solutions.png` | 800 × 800, black or transparent | Round badge on the BeeHyv experience card | Circular mission patch: a honeycomb of hexagons with a small satellite and a data stream, no text. |
| `education-crest.png` | 800 × 800, black background | Square crest on the IIIT Nagpur card | Academy crest shield with a star chart, an open book and a small rocket. |
| `code-content-banner.png` | 1800 × 600, black background | Strip under the Code & Content heading | Split scene: a pilot at a cockpit console with abstract glyph streams on the left, the same pilot on a stage with a microphone and a script on the right. |
| `achievements-banner.png` | 1800 × 600, black background | Strip under the Achievements heading | Trophy shelf bolted to a ship bulkhead: cups, medals, a laurel wreath around a small planet, a numberless stopwatch. |
| `writing-banner.png` | 1800 × 600, black background | Strip under the Writing heading | A writer's desk in a space-station observation deck: typewriter, ink bottle, pages drifting in zero gravity, a nebula through the big window. |
| `contact-signal.png` | 1200 × 675, black background | Left column of Contact, under the social links | A comms dish on a small asteroid outpost beaming signal arcs across the void toward a distant starfighter. |

## Checklist for readability

- Keep the main subject large and centred; thumbnails are shown at about 560 px wide.
- Prefer thick outlines over fine detail. Fine hatching turns to mud at small sizes.
- Pure black (#000) backgrounds blend into the page; a transparent PNG is best for the hero ship.
