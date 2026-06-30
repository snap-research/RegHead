# RegHead — Project Website

Static site for **RegHead: Non-Humanoid Head Blendshapes via Feed-Forward Registration** (ECCV 2026).

The landing hero is a dataset-first interactive: a synced **expression slider** drives a grid of
animal-head identities through the same 10 facial expressions. Scrolling reveals the paper sections
(abstract / method / results are placeholders; the dataset section is complete).

## Structure
```
index.html            # single-page site
css/style.css         # styles
js/main.js            # synced expression-slider hero
assets/dataset/       # 8 curated identities × 10 expressions (400px JPEG, real samples)
```

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Built as a preview. Intended to later live on the `website` branch of `snap-research/RegHead`.
