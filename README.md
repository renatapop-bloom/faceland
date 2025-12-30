# Faceland × Bloomreach Engagement Sandbox Guide Web App

## Goal

Build a **very simple, static web app** that turns the “Faceland – Bloomreach Engagement Sandbox Guide” PDF/HTML and screenshots into an **interactive guide**.  
The app will be hosted on **GitHub Pages** and must be **reachable from any IP**.

The app should:

- Show a **password gate** as the first screen (one shared password, same for everyone).
- After correct password, show a **single‑page guide** with:
  - An **accordion** of sections that follow the structure/content of the PDF/HTML.
  - An always‑visible **right‑hand side panel** with all 💡 “reminders” / tips.
- Use a **Faceland‑style visual design**, roughly matching the palette / feeling of https://www.facelandclinic.com/en/ and the attached Faceland screenshot (cream background, black text, soft cards, some gold accents).
- Be **static HTML/CSS/JS only** (no backend, no build step required).

All content and links should be taken from (or be consistent with):

- `FacelandBloomreachEngagementSandboxGuide.html`
- `Faceland-_-Bloomreach-Engagement-Sandbox-Guide.pdf`
- The individual screenshot images (JPG/PNG/GIF) that match sections of the PDF.

---

## Files provided in this repo

- `FacelandBloomreachEngagementSandboxGuide.html`  
- `Faceland-_-Bloomreach-Engagement-Sandbox-Guide.pdf`  
- A set of `.jpg` / `.png` images that correspond to the figures in the guide (e.g. invitation email, customer profile, segmentation, scenarios, weblayers, dashboards, etc.).  
- This `README.md`.

You can assume the HTML file contains the same text as the PDF and is easier to parse.

---

## Functional requirements

### 1. Password gate

- First screen is a **simple password form**:
  - One **password input**.
  - One **button** “Unlock guide”.
  - Below, small explanatory copy (e.g. “Use the shared sandbox password from the enablement email.”).
- The **password string** should be defined in a single constant in JS, e.g.:

# faceland
