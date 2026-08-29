---
# =============================================================================
# SZABLON NOWEGO PROJEKTU — skopiuj ten plik, uzupełnij, wrzuć razem z grafikami
# =============================================================================
#
# JAK UŻYWAĆ
# 1. Skopiuj ten plik jako: public/portfolio/{folderName}/project.md
#    (obok cover, bg, 1.webp, 2.1.webp itd.)
# 2. Uzupełnij pola EN na górze + tłumaczenia w i18n.pl / i18n.pa
# 3. Napisz do mnie: „zaktualizuj projekt z folderu {folderName}”
#    — przepiszę treść do src/content/projects/{slug}.md i podepnę media
#
# GRAFIKI (w tym samym folderze public/portfolio/{folderName}/)
# - cover.webp | cover.webm | cover.mp4  → miniatura / wideo na liście
# - bg.webp                             → tło hero (lub ustaw heroImage)
# - 1.webp                              → grafika overview (opcjonalnie)
# - 2.webp, 3.webp…                     → pełna szerokość w galerii
# - 2.1.webp + 2.2.webp                 → para w rzędzie (to samo dla 3.1/3.2…)
# - afterGroup: N w sekcji = wstaw tekst PO leadzie grupy N (np. po 2.webp, przed 2.1)
#
# PUSTE POLE = element ukryty na stronie (label / title / text / info row / live…)
# theme sekcji: light | dark | muted
# categories: ux-ui | motion | ai-engineering | development | branding
# =============================================================================

# --- Karta / lista projektów ---
title: 'Project Name'
client: 'Client Name'
tags: ['Branding']
categories: ['branding']
order: 99
comingSoon: false

# --- Media (ścieżki względem /public) ---
folderName: 'project-slug'
thumbnail: '/portfolio/project-slug/cover.webp'
video: ''
heroImage: '/portfolio/project-slug/bg.webp'
heroBackground: ''
logo: ''
overviewGraphic: ''

# --- Hero ---
# clientLabel: tekst w [ … ] nad nazwą klienta. Puste = domyślne UI (Client/Klient/Cliente)
clientLabel: ''
heroSubtitle: |-
  Short hero line one
  Short hero line two

# --- Info row (puste = wiersz ukryty) ---
service: 'Brand Identity, Web Design'
industry: 'Real Estate'
market: 'Panama'
tools: ''
year: 2025

# --- Live (podkreślony link). liveLabel = napis, liveUrl = adres ---
liveLabel: ''
liveUrl: ''

# --- Overview / Kontekst ---
# overviewLabel: tekst w [ … ]. Puste = domyślne UI (Overview / Kontekst / Descripción)
overviewLabel: ''
overviewTitle: 'Overview heading goes here'
overviewText: |-
  First paragraph of the overview.

  Second paragraph of the overview.

# --- Sekcje treści (max 8). Każda: label, title, text, theme, afterGroup ---
sections:
  - label: Section 01
    theme: dark
    afterGroup: 2
    title: 'Section one heading'
    text: |-
      Section one body.

      - **Point one**: Detail text.
      - **Point two**: Detail text.

  - label: Section 02
    theme: muted
    afterGroup: 3
    title: 'Section two heading'
    text: |-
      Section two body.

  - label: Section 03
    theme: light
    afterGroup: 4
    title: 'Section three heading'
    text: |-
      Section three body.

  # Kolejne sekcje (04–08) — odkomentuj / skopiuj wzorzec powyżej.
  # Bez afterGroup = sekcja na końcu strony (po galerii).
  # - label: Section 04
  #   theme: dark
  #   afterGroup: 5
  #   title: ''
  #   text: ''

# --- Cytat / Opinia klienta (pod ostatnią sekcją summary, opcjonalnie) ---
quoteLabel: '' # Puste = domyślne [CLIENT REVIEW] / [OPINIA KLIENTA] / [OPINIÓN DEL CLIENTE]
quote: '' # Treść cytatu / opinii klienta
quoteAuthor: '' # Imię i nazwisko (np. NEDELKA VELASCO)
quoteRole: '' # Stanowisko / firma (np. CEO OF NRV)

# --- Tłumaczenia: tylko pola do nadpisania (reszta bierze EN) ---
i18n:
  pl:
    clientLabel: ''
    heroSubtitle: |-
      Krótka linia hero jeden
      Krótka linia hero dwa
    service: ''
    industry: ''
    market: ''
    tools: ''
    liveLabel: ''
    overviewLabel: ''
    overviewTitle: 'Nagłówek kontekstu'
    overviewText: |-
      Pierwszy akapit.

      Drugi akapit.
    quoteLabel: ''
    quote: ''
    quoteAuthor: ''
    quoteRole: ''
    sections:
      - label: Sekcja 01
        title: 'Nagłówek sekcji jeden'
        text: |-
          Treść sekcji jeden.

          - **Punkt jeden**: Opis.
          - **Punkt dwa**: Opis.
      - label: Sekcja 02
        title: 'Nagłówek sekcji dwa'
        text: |-
          Treść sekcji dwa.
      - label: Sekcja 03
        title: 'Nagłówek sekcji trzy'
        text: |-
          Treść sekcji trzy.

  pa:
    clientLabel: ''
    heroSubtitle: |-
      Línea hero uno
      Línea hero dos
    service: ''
    industry: ''
    market: ''
    tools: ''
    liveLabel: ''
    overviewLabel: ''
    overviewTitle: 'Título del overview'
    overviewText: |-
      Primer párrafo.

      Segundo párrafo.
    quoteLabel: ''
    quote: ''
    quoteAuthor: ''
    quoteRole: ''
    sections:
      - label: Sección 01
        title: 'Título sección uno'
        text: |-
          Texto sección uno.

          - **Punto uno**: Detalle.
          - **Punto dos**: Detalle.
      - label: Sección 02
        title: 'Título sección dos'
        text: |-
          Texto sección dos.
      - label: Sección 03
        title: 'Título sección tres'
        text: |-
          Texto sección tres.
---

<!-- Body markdown nie jest używane — cała treść jest w frontmatterze powyżej. -->
