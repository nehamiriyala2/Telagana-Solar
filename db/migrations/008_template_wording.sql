-- The company does not offer free site visits. Replace that wording in the seeded "day 3" WhatsApp template
-- only where it still says so; templates staff rewrote themselves are left as they are.
UPDATE wa_templates SET body = 'Hello {name}, this is Telangana Solar following up. If you share a photo of your roof and your latest electricity bill on WhatsApp, we can suggest the right system size for your home in {district}.'
  WHERE `key` = 'day3' AND lang = 'en' AND body LIKE '%free site visit%';
UPDATE wa_templates SET body = 'నమస్కారం {name} గారు, తెలంగాణ సోలార్ నుండి మళ్ళీ సంప్రదిస్తున్నాం. మీ పైకప్పు ఫోటో, తాజా కరెంటు బిల్లు వాట్సాప్‌లో పంపితే, {district}లో మీ ఇంటికి సరైన సిస్టమ్ సైజు సూచిస్తాం.'
  WHERE `key` = 'day3' AND lang = 'te' AND body LIKE '%ఉచిత సైట్ విజిట్%';
