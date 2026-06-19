# RegHead Image Blendshape Dataset

### A large-scale dataset of non-humanoid (animal) head identities, each rendered across 10 consistent facial expressions.

<p align="left">
  <img alt="ECCV 2026" src="https://img.shields.io/badge/ECCV-2026-1a73e8">
  <img alt="Identities" src="https://img.shields.io/badge/identities-33%2C724-success">
  <img alt="Images" src="https://img.shields.io/badge/images-337%2C240-success">
  <img alt="Expressions" src="https://img.shields.io/badge/expressions%2Fidentity-10-blueviolet">
  <img alt="Format" src="https://img.shields.io/badge/format-WebDataset-orange">
  <img alt="License" src="https://img.shields.io/badge/license-Snap%20Non--Commercial-lightgrey">
</p>

This is the official image dataset accompanying **[ECCV 2026] RegHead: Non-Humanoid Head
Blendshapes via Feed-Forward Registration**. It provides paired multi-expression imagery for
a large, diverse population of non-humanoid (animal) head identities — the kind of consistent,
expression-aligned supervision needed to learn and evaluate head blendshapes beyond the human
face.

---

## 📋 Overview

Each **identity** is one distinct animal head (e.g. *a photorealistic Doberman with round eyes
wearing a pirate hat*) rendered in the **same 10 facial expressions**. Because every identity
shares the same expression vocabulary, the dataset gives you **aligned cross-expression pairs
for a fixed identity** — directly usable for expression editing, blendshape learning, identity-
preserving animation, and registration.

| | |
|---|---|
| **Identities** | 33,724 |
| **Expressions per identity** | 10 (complete for every identity) |
| **Total images** | 337,240 |
| **Per-sample packaging** | 1 identity = 1 WebDataset sample (10 images + 1 JSON) |
| **Available resolutions** | 512×512 and 1024×1024 |
| **Image format** | JPEG (quality 95) |
| **Container** | [WebDataset](https://github.com/webdataset/webdataset) `.tar` shards |
| **License** | Snap Inc. Non-Commercial License (research only) |

### The 10 expressions

Every identity contains exactly these ten expression images:

| Field | Meaning |
|-------|---------|
| `open_m_open_e`   | open mouth, open eyes (neutral reference) |
| `halfo_m_o_e`     | half-open mouth, open eyes |
| `close_m_o_e`     | closed mouth, open eyes |
| `close_m_halfo_e` | closed mouth, 50%-open eyes |
| `close_m_0_25o_e` | closed mouth, 25%-open eyes |
| `close_m_0_75o_e` | closed mouth, 75%-open eyes |
| `close_m_close_e` | closed mouth, closed eyes |
| `close_m_smile`   | closed-mouth smile |
| `raise_eyebrows`  | raised eyebrows |
| `frown`           | frown |

---

## 📊 Data distribution

**Identities are sampled as combinations of four attributes** — an animal, a render style, a
facial feature, and 1–2 accessories — yielding broad visual diversity across the population.

| Attribute | Pool size | Examples |
|-----------|-----------|----------|
| Animal      | ~270 | Doberman, Polar Bear, Cormorant, Mole, Antelope, Owl, Reindeer, Giant Anteater, … |
| Render style| 4    | Photorealistic · Plastic Toy Render · Computer Animated Film-Style 3D · Video Game NPC Style |
| Feature     | ~38  | round eyes, fluffy cheeks, bushy eyebrows, arched eyebrows, curved horns, … |
| Accessories | ~57  | pirate hat, bunny-ear headband, party hat, space helmet, laurel crown, … (1 or 2 per identity) |

**Render-style distribution** (≈ uniform across the four styles):

| Style | Identities | Share |
|-------|-----------:|------:|
| Video Game NPC Style | 8,600 | 25.5% |
| Plastic Toy Render   | 8,427 | 25.0% |
| Photorealistic       | 8,426 | 25.0% |
| Computer Animated Film-Style 3D  | 8,271 | 24.5% |

**Expression completeness:** 100% — all 33,724 identities have all 10 expressions
(337,240 / 337,240 image fields present). Identities with missing or corrupt frames were
excluded prior to release (11 removed from an inspected set of 33,735).

**Provenance split:** ~59% (19,935) of identities are newly generated for this release via the
pipeline below; ~41% (13,789) come from an earlier consistent generation batch using the same
expression vocabulary and models.

---

## 🛠️ How the dataset was created

The dataset is produced by a **three-stage generative pipeline**. A base head is generated,
neutralized into a clean reference, then edited into each target expression with a chain of
expression-specific image-editing models.

```
            ┌─────────────────────┐   ┌──────────────────────┐   ┌────────────────────────────┐
 prompt ──▶ │ Stage 0: text→image │──▶│ Stage 1: neutralize  │──▶│ Stage 2: expression edits  │
            │ OpenAI gpt-image-1  │   │ OpenAI (→ open_m_    │   │ Qwen-Image + LoRA adapters │
            │ (sample identity)   │   │  open_e reference)   │   │ (chained, 10 expressions)  │
            └─────────────────────┘   └──────────────────────┘   └────────────────────────────┘
```

1. **Stage 0 — Text-to-image (identity creation).** A prompt is assembled from a seeded random
   combination of *animal × style × feature × accessories* and rendered with OpenAI's image model
   to create the base identity.
2. **Stage 1 — Neutralization.** The base image is converted into a clean, floating-head neutral
   reference on a white background: the `open_m_open_e` (open-mouth / open-eyes) frame.
3. **Stage 2 — Expression editing.** Expression-specific **Qwen-Image LoRA adapters** edit the
   reference into the remaining expressions. Edits are **chained** for consistency:
   - `open_m_open_e` → (close-mouth adapter) → `halfo_m_o_e`, `close_m_o_e`
   - `close_m_o_e` → (close-eye adapter) → `close_m_close_e`, `close_m_halfo_e`, `close_m_0_25o_e`, `close_m_0_75o_e`
   - `close_m_o_e` → (frown/smile/eyebrow adapter) → `close_m_smile`, `raise_eyebrows`, `frown`

   The closed-mouth / open-eyes frame (`close_m_o_e`) is used as the editing base for the seven
   downstream expressions so that the mouth stays correctly closed throughout.

Generation is **seeded** for reproducibility, so the identity set is deterministic and a smaller
sample is a strict prefix of a larger one.

> **Image origin & third-party tools.** All images are model-generated (no captured/real photos).
> Stages 0–1 use the **OpenAI GPT image model**; Stage 2 uses the **Qwen-Image** editing model
> (Apache-2.0) with custom LoRA adapters. See [License](#-license) for terms.

---

## 🔬 Two releases: 512 vs 1024

The dataset ships in two resolution variants with **identical content, identity sets, expressions,
metadata, and per-sample layout** — they differ only in image resolution and total size. Pick the
one that fits your compute and resolution needs.

| | **512 release** | **1024 release** |
|---|---|---|
| Release tag | `reghead-webdataset-v1-512` | `reghead-webdataset-v1-1024` |
| Resolution | 512 × 512 | 1024 × 1024 |
| Image format | JPEG q95 | JPEG q95 |
| Identities | 33,724 | 33,724 |
| Images | 337,240 | 337,240 |
| Shards (`.tar`) | 11 | 34 |
| Total size | **18.96 GiB** (19,412 MiB) | **58.79 GiB** (60,200 MiB) |
| Max shard size | < 1900 MiB (GitHub-Release safe) | < 1900 MiB (GitHub-Release safe) |
| Best for | fast prototyping, lightweight training, limited bandwidth/disk | high-resolution training, detail-sensitive editing & evaluation |

> Both variants encode the same source frames; the 512 release is a downscaled copy. Train/develop
> on 512, then scale to 1024 without changing any data-loading code — only the shard URLs change.

---

## 📦 Asset layout

Each release consists of:

```
reghead-v1-<res>-000000.tar      # WebDataset image shards (the bulk of the data)
reghead-v1-<res>-000001.tar
...
metadata.tar.gz                  # release_manifest.json + webdataset_samples.jsonl
checksums.tar.gz                 # SHA256SUMS for every shard
```

**Inside each shard**, every identity is one sample — a group of files sharing a common key:

```
00000000_id000_Doberman_Dog_..._64896c31.open_m_open_e.jpg
00000000_id000_Doberman_Dog_..._64896c31.close_m_o_e.jpg
...                              # 10 .jpg files, one per expression
00000000_id000_Doberman_Dog_..._64896c31.json     # per-sample metadata
```

**Per-sample JSON** schema:

```json
{
  "identity": "id000_Doberman_Dog_Photorealistic_round_eyes_a_wreath_a_pirate_hat",
  "identity_dir": "id000_Doberman_Dog_Photorealistic_round_eyes_a_wreath_a_pirate_hat",
  "sample_key": "00000000_id000_Doberman_Dog_..._64896c31",
  "num_expressions": 10,
  "expressions": [
    {"expression": "close_m_0_25o_e", "field": "close_m_0_25o_e.jpg", "original_file": "close_m_0_25o_e.jpg"},
    ...
  ]
}
```

`metadata/webdataset_samples.jsonl` provides a flat index (one row per identity:
`sample_key → identity → shard → num_expressions`), and `metadata/release_manifest.json`
lists every shard with its size and SHA-256.

---

## 🚀 How to use

### 1. Download

```bash
# 512 release (smaller, ~19 GiB)
gh release download reghead-webdataset-v1-512 \
  --repo snap-research/RegHead --dir reghead_download

# or the 1024 release (~59 GiB)
gh release download reghead-webdataset-v1-1024 \
  --repo snap-research/RegHead --dir reghead_download
```

### 2. Verify checksums (optional but recommended)

```bash
cd reghead_download
tar -xzf checksums.tar.gz                    # extracts checksums/SHA256SUMS
mkdir -p data && mv reghead-v1-*.tar data/   # SHA256SUMS paths are data/-relative
sha256sum -c checksums/SHA256SUMS
```

### 3. Extract metadata

```bash
tar -xzf metadata.tar.gz                     # → metadata/{release_manifest.json,webdataset_samples.jsonl}
```

### 4. Load with WebDataset

```bash
pip install webdataset pillow
```

```python
import glob, json
import webdataset as wds

urls = sorted(glob.glob("reghead_download/data/*.tar"))

EXPRESSIONS = [
    "open_m_open_e", "halfo_m_o_e", "close_m_o_e", "close_m_halfo_e",
    "close_m_0_25o_e", "close_m_0_75o_e", "close_m_close_e",
    "close_m_smile", "raise_eyebrows", "frown",
]

def parse_identity_sample(sample):
    meta = sample["json"]
    if isinstance(meta, (bytes, bytearray)):
        meta = json.loads(meta.decode("utf-8"))
    images = {expr: sample[f"{expr}.jpg"] for expr in EXPRESSIONS
              if f"{expr}.jpg" in sample}
    return {"identity": meta["identity"], "images": images, "metadata": meta}

dataset = wds.WebDataset(urls).decode("pil").map(parse_identity_sample)

for item in dataset:
    print(item["identity"], list(item["images"].keys()))
    # item["images"]["frown"] is a PIL.Image
    break
```

> **Note:** image fields use the **`.jpg`** extension. Decode with `.decode("pil")` to get
> `PIL.Image` objects (or `.decode("torchrgb")` for tensors).

---

## 📁 What this dataset does *not* include

Per the license, this release contains **only the 2D animal-head images and their accompanying
metadata**. It does **not** include any 3D models, meshes, textures, blendshape rigs, model
weights, checkpoints, the registration model, or training code.

---

## 📜 License

This dataset is released under the **Snap Inc. Non-Commercial License** — for non-commercial,
research purposes only. See the [`LICENSE`](LICENSE) file for the full text.

**Third-party tools** used to generate the imagery are governed by their own terms:
- **OpenAI GPT image model** — used to generate neutral-expression animal-head images.
- **Qwen-Image editing model** — used to generate the expression edits; Qwen-Image is licensed
  under the Apache License 2.0.

No third-party software, model weights, checkpoints, or code is licensed under this license.

---

## 📝 Citation

If you use this dataset, please cite RegHead:

```bibtex
@inproceedings{reghead2026,
  title     = {RegHead: Non-Humanoid Head Blendshapes via Feed-Forward Registration},
  booktitle = {Proceedings of the European Conference on Computer Vision (ECCV)},
  year      = {2026}
}
```
