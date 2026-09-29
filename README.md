# Integrated Project Controls Risk Framework, Prototype Dashboard

An interactive prototype dashboard for an integrated project-controls framework that combines cost, schedule, risk, change, contractor performance, constructability, and sequencing data into a single early-warning system for state-of-good-repair passenger-rail and transit capital programs.


## What's in this repository

| File | What it does |
|---|---|
| `index.html` | Page structure and layout |
| `style.css` | Styling |
| `data.js` | The synthetic project portfolio the dashboard runs on |
| `index.js` | Scoring logic: normalization, domain rollups, and the composite score calculation |

These four files depend on each other and need to stay in the same folder. `index.html` loads `style.css`, `data.js`, and `index.js` by relative path, so downloading `index.html` alone will not work.

The full technical evidence package this dashboard is part of, a methodology white paper, a data dictionary, an indicator/formula register, a risk taxonomy, a scenario-test pack, a validation report, and a master change log, is maintained separately and is not included in this repository. Reach out for a copy.

## Running it

**Option 1, locally:** clone the repository (or download all four files into one folder) and open `index.html` in any modern browser. No build step, no server, no dependencies beyond the page itself.

```
git clone https://github.com/deyemi74/Integrated-Project-Controls-Risk-Forecasting.git
cd Integrated-Project-Controls-Risk-Forecasting
open index.html
```

**Option 2, GitHub Pages:** since this is a static site with no build step, it can be served directly from this repository by enabling GitHub Pages on the `main` branch, if that isn't already turned on.
Or visit https://deyemi74.github.io/Integrated-Project-Controls-Risk-Forecasting/

Once it's open, click through the ranked project list on the left to see each project's domain breakdown, composite score, and primary risk driver. Edit any raw input field to see every score recalculate live. Expand the formula reference panel under any domain to trace a score back to its exact formula and current value.


## The framework in brief

Each of seven domains reduces to a small number of transparent, auditable indicators, normalized onto a common 0-100 scale, and combined into a single weighted composite score with the driving domain always named explicitly, not just color-coded:

- **Cost**: budget growth, estimate-at-completion variance, contingency drawdown
- **Schedule**: finish-date slip, float erosion, milestone compliance
- **Risk**: aggregate risk exposure, overdue mitigation actions
- **Change**: pending change exposure, change aging
- **Contractor Performance**: schedule submission compliance
- **Constructability**: unresolved high-severity issues, issue aging
- **Sequencing/Interfaces**: unresolved access or work-zone conflicts

## Validation Status

The framework has been checked against six validation tests, run against the full evidence package this dashboard is one part of. Two pass cleanly, one passes with a documented exception, one is a partial pass with a named open item, and two cannot be completed yet by design.

| Test | Result |
|---|---|
| Calculation Reproducibility | **Pass**: identical results from three independently written implementations (Excel, Python, JavaScript) |
| Explainability | **Pass**: every score traces to a named domain driver and an indicator-level formula |
| Scenario Sensitivity | **Pass, with one noted exception**: a compound-failure test scenario pushed every domain into the elevated-to-critical range, but the weighted composite landed just under the critical threshold. Reported as a calibration finding, not corrected after the fact |
| Data Integrity | **Partial**: per-field validation is complete; cross-field consistency checks are not yet built |
| Back-Test | **Not yet performed**: requires real, authorized historical project outcomes, which this prototype deliberately does not use |
| Calibration | **Not yet applicable**: no threshold or weight has been revised, since no real performance data exists yet to justify a revision |

Full detail, including the exact evidence behind each result, is in the Validation Report maintained alongside this repository.

## Known Limitations

- All thresholds and domain weights are provisional starting hypotheses, not validated findings
- No back-testing has been performed against real project outcomes
- This dashboard does not support multi-period trend analysis; it holds a single reporting-period snapshot per project
- Invalid input is silently rejected rather than flagged with a visible error
- This is a decision-support tool, not a substitute for engineering judgment, and has no bearing on structural design, safety certification, or contractual determinations

## Roadmap

- Add cross-field data-quality rules (duplicate detection, date-order consistency checks)
- Add multi-period trend logic once a suitable synthetic or authorized historical dataset exists
- Back-test against real, authorized historical project data as it becomes available
- Recalibrate thresholds and domain weights based on back-test results, not preference

## Data Governance

This framework is designed to run on synthetic or properly authorized data only. No confidential, proprietary, or employer-owned project data appears anywhere in this repository. Where authorized historical data is used in the future, project and vendor details will be de-identified and the authorization retained on record.

## Author

Mohammed Adeyemi Yusuf
