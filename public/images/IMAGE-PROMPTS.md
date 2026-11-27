# Telangana Solar: image prompts

The site now uses a light, sunny blue palette that matches the blue solar panels in the current photos, so
**the existing photos stay**. Prompts below are only for slots that are missing or worth upgrading later.

**How to use:** generate the image, export as WebP (quality ~80, under 250 KB where possible) and save it
over the file name listed. Components pick it up with no code change. Until a file exists, a soft mist
placeholder shows behind the image slot so the layout never breaks.

## Style (add to every prompt)

> Realistic, clean premium photography, golden-hour or soft morning light, fresh and sunny, Telangana /
> Hyderabad setting, blue monocrystalline solar panels, light blue sky with a little warm sun glow,
> cream or white walls, green trees. No text, no logos, no watermarks, no faces in focus. Same lighting and
> colour grade as the current hero photo.

## Missing now (return 404 today)

| Save as | Size | Prompt |
|---|---|---|
| `public/photos/types/ongrid.webp` | 600×600 | Rooftop with blue solar panels connected to a net meter on a cream wall, grid pole in the soft-focus background, morning light |
| `public/photos/types/offgrid.webp` | 600×600 | Small rural home with blue solar panels and a battery cabinet on a shaded verandah, no grid poles in sight, warm morning light |

## Optional upgrades (only if you want a more consistent set)

| Save as | Size | Prompt |
|---|---|---|
| `public/hero/house-sunrise.webp` (+ `.jpg` poster, `house-sunrise-960.webp`) | 2400×1400 | Wide golden-hour view of a cream Hyderabad house with blue rooftop panels and a terrace garden, Charminar-style skyline softly blurred far away, the left 45% calm light sky for the headline |
| `public/solutions/how-solar-house.webp` (+ `.jpg`) | 1100×941 | Keep the current composition (labels sit on panels, inverter, entrance and grid): clean flat illustration of a cream house with blue panels, inverter, net meter and grid pole, gold arrows, sky-blue lines, light background |
| `public/images/cta-sunrise.webp` (new, not wired yet) | 2400×900 | Soft sunrise over Hyderabad rooftops with blue panels, very light and airy, pale blue and gold sky, empty centre |

Team portraits in `public/team/` are real people: keep them.
