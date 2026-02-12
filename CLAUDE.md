# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Study Cards is a static flashcard application built with vanilla HTML, CSS, and JavaScript. No build tools or package manager required.

## Development

Open `index.html` directly in a browser to run the application locally. No server required.

## Deployment

Automatically deployed to GitHub Pages on push to `main` branch via `.github/workflows/deploy.yml`.

## Architecture

- **index.html**: Single-page app structure with card container, set selector dropdown, and navigation controls
- **script.js**: All application logic including:
  - `cardSets` object at top of file contains all flashcard data (edit this to add/modify card sets)
  - Card navigation (next/prev/shuffle)
  - Set switching via dropdown
  - Keyboard navigation (arrow keys for nav, space/enter to flip)
- **styles.css**: CSS-only 3D flip animation using `transform: rotateY(180deg)` and `backface-visibility`

## Adding New Card Sets

Edit the `cardSets` object in `script.js`:
```javascript
const cardSets = {
    "Set Name": [
        { question: "Question text", answer: "Answer text" },
        // ...
    ]
};
```
