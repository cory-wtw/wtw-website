# Update Dashboard — Instructions for Claude Code

This file tells Claude Code exactly how to update the Worth Their Weight transparency dashboard whenever you export new transactions from your bookkeeping app.

---

## When to run this

Whenever you reconcile your books:

1. Export transactions from your bookkeeping app as `Transactions-Export.xls`
2. Open Claude Code in this repo folder
3. Tell Claude Code where the file is (e.g. `~/Downloads/Transactions-Export.xls`) and say: **"Follow update-dashboard.md"**

---

## What Claude Code should do

You are updating the financial transparency dashboard for Worth Their Weight, a veterans nonprofit. A spreadsheet exported from the user's bookkeeping app is available at the path the user provided (typically `~/Downloads/Transactions-Export.xls`).

### Step 1 — Read the spreadsheet

The file is a **legacy binary .xls** (CDFV2 / BIFF). Use `xlrd==2.0.1` via Python to read it. If `xlrd` isn't installed, install it with `pip3 install --user xlrd==2.0.1`.

The file has **one sheet named `Transactions`** with these columns (row 0 is the header):

| Col | Name | Example |
|---|---|---|
| A | Date | 2026-04-10 |
| B | Description | Flyers |
| C | Category | Materials and supplies |
| D | Amount | -69.92 (expenses are negative) |
| E | Note | (often blank) |

**Important:**
- Expenses are stored as **negative** numbers. Take `abs()` of the amount.
- Do not trust the column order blindly — verify headers match.
- Skip the header row (row 0).

### Step 2 — Compute values

From the transactions:

| Value | How to compute |
|---|---|
| `totalSpent` | Sum of `abs(amount)` across all rows, rounded to nearest dollar |
| `transactionCount` | Number of data rows (not including header) |
| Per-category totals | Group by column C (Category), sum `abs(amount)` in each group |

For the `spend` array, for each category:
- `pct = round((category_total / totalSpent) * 100)`
- `amount` = formatted as `"$X,XXX"` (whole dollars, comma separators, no cents)
- `label` = a clean display label (see mapping below)

Sort categories by amount descending (largest first).

### Step 3 — Clean up category labels

Your bookkeeping app uses verbose category names. Map them to clean display labels:

| Bookkeeping category | Display label |
|---|---|
| `Equipment (less than $2500)` | `Equipment` |
| `Start Up / Organizational fees` | `Startup & legal fees` |
| `Materials and supplies` | `Materials & supplies` |
| `Contract labor` | `Contract labor` |
| `Software` | `Software` |
| `Telephone` | `Telephone` |
| `Transportation` | `Transportation` |
| `Printing & supplies` | `Printing & supplies` |
| `Legal and professional services` | `Legal & professional` |

**If you encounter a category not in this table**, use the bookkeeping category name as-is but:
- Replace ` and ` with ` & `
- Strip parenthetical qualifiers like `(less than $2500)`
- Keep it under ~25 characters
- Add the new mapping to this table in a follow-up edit to `update-dashboard.md`

### Step 4 — Open `index.html`

Find the block between these two comments:

```
<!-- DASHBOARD DATA — UPDATE HERE -->
```
and
```
<!-- END DASHBOARD DATA -->
```

Replace **only** the values inside the `const DASHBOARD = { ... }` object.

**Do not change:**
- `totalDonated` — this is a **manual** value the user edits by hand. Leave it alone unless the user explicitly gives you a new number.
- HTML structure, class names, CSS, or any other JavaScript.
- Any content outside the `DASHBOARD` block.

**Do update:**
- `totalSpent`
- `transactionCount`
- `spend` array (replace entirely with new dynamic categories)
- `lastUpdated` — set to today's date formatted as `"Month D, YYYY"` (e.g. `"April 10, 2026"`)

### Step 5 — Save the file

Save `index.html` with the updated values.

### Step 6 — Show a summary

Show a summary table of every value that changed, with old value → new value, including each category. Then confirm the file is ready to deploy.

---

## Manual values — not touched by this workflow

These values in the `DASHBOARD` object are edited by hand and should **never** be changed by Claude Code unless the user explicitly asks:

- `totalDonated` — total donations received (user tracks this separately)

The cases/impact section is currently a "coming soon" callout in the HTML. When the org has real case outcomes to share, that will be a separate manual edit.

---

## Deploy to Netlify

After Claude Code confirms the update:

```bash
git add index.html
git commit -m "Dashboard update — [today's date]"
git push
```

Netlify auto-deploys on push. Site is live within ~30 seconds.

---

## Reference: parsing script

Here's a working Python snippet Claude Code can adapt:

```python
import xlrd
from collections import defaultdict

book = xlrd.open_workbook('/path/to/Transactions-Export.xls')
sh = book.sheet_by_name('Transactions')

# Verify header
headers = [sh.cell_value(0, c) for c in range(sh.ncols)]
assert headers[:4] == ['Date', 'Description', 'Category', 'Amount'], f"Unexpected headers: {headers}"

totals = defaultdict(float)
grand = 0.0
count = 0
for r in range(1, sh.nrows):
    cat = str(sh.cell_value(r, 2)).strip()
    amt = abs(float(sh.cell_value(r, 3)))
    totals[cat] += amt
    grand += amt
    count += 1

print(f"Total spent: ${round(grand):,}")
print(f"Transactions: {count}")
for cat, amt in sorted(totals.items(), key=lambda x: -x[1]):
    pct = round((amt/grand)*100)
    print(f"  {cat}: ${round(amt):,} ({pct}%)")
```
