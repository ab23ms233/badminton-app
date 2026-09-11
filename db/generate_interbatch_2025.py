import pandas as pd
import json
import re
from pathlib import Path

INPUT = "Match_Results_InterBatch_2025.xlsx - Results.csv"
OUTPUT = "match_results_interbatch_2025.js"

df = pd.read_csv(INPUT)

def clean(v):
    if pd.isna(v):
        return None
    s = str(v).strip()
    if s in ("", "-", "–", "—", "nan"):
        return None
    return re.sub(r"\s+", " ", s)

def players(v):
    v = clean(v)
    if not v:
        return []
    return [re.sub(r"\s+", " ", x.strip()) for x in v.split("/") if x.strip()]

def score(v):
    v = clean(v)
    if v is None:
        return None
    try:
        return int(float(v))
    except:
        return None

def parse_team_pair(v):
    v = clean(v)
    if not v:
        return None, None
    parts = re.split(r"\s+vs\s+", v, flags=re.I)
    if len(parts) != 2:
        parts = re.split(r"\s+VS\s+", v, flags=re.I)
    if len(parts) != 2:
        raise ValueError(f"Could not split teams: {v!r}")
    return parts[0].strip(), parts[1].strip()

def parse_match(match_type, row_a, row_b, player_col, score_cols):
    raw_a = clean(row_a.iloc[player_col])
    raw_b = clean(row_b.iloc[player_col])

    # Explicit walkover in either player's/match cell.
    walkover_text = next(
        (x for x in (raw_a, raw_b) if x and "walkover" in x.lower()),
        None
    )

    if walkover_text:
        return {
            "matchType": match_type,
            "status": "WALKOVER",
            "teamAPlayers": [],
            "teamBPlayers": [],
            "sets": [],
            "walkover": walkover_text,
            "winnerSide": None
        }

    pa = players(raw_a)
    pb = players(raw_b)

    sets = []
    for a_col, b_col in score_cols:
        a = score(row_a.iloc[a_col])
        b = score(row_b.iloc[b_col])
        if a is None and b is None:
            continue
        sets.append({"teamAScore": a, "teamBScore": b})

    if not pa and not pb and not sets:
        return None

    aw = sum(
        1 for s in sets
        if s["teamAScore"] is not None
        and s["teamBScore"] is not None
        and s["teamAScore"] > s["teamBScore"]
    )
    bw = sum(
        1 for s in sets
        if s["teamAScore"] is not None
        and s["teamBScore"] is not None
        and s["teamBScore"] > s["teamAScore"]
    )

    winner_side = "team_a" if aw > bw else "team_b" if bw > aw else None

    return {
        "matchType": match_type,
        "status": "COMPLETED",
        "teamAPlayers": pa,
        "teamBPlayers": pb,
        "sets": sets,
        "winnerSide": winner_side
    }

# Exact column positions in the uploaded CSV:
# Singles players=3, scores=4,5,6
# Doubles players=7, scores=8,9,10
# Reverse Singles players=11, scores=12,13,14

fixtures = []
current_date = None
i = 0

while i < len(df):
    row = df.iloc[i]

    date = clean(row.iloc[0])
    if date:
        current_date = date

    team_text = clean(row.iloc[1])
    category = clean(row.iloc[2])

    if not team_text:
        i += 1
        continue

    team_a, team_b = parse_team_pair(team_text)

    # Determine whether this is a normal 2-row fixture.
    row_b = df.iloc[i + 1] if i + 1 < len(df) else None
    if row_b is None:
        row_b = row

    matches = []

    definitions = [
        ("SINGLES", 3, [(4,4), (5,5), (6,6)]),
        ("DOUBLES", 7, [(8,8), (9,9), (10,10)]),
        ("REVERSE_SINGLES", 11, [(12,12), (13,13), (14,14)]),
    ]

    for match_type, pcol, score_cols in definitions:
        match = parse_match(
            match_type, row, row_b, pcol, score_cols
        )
        if match:
            matches.append(match)

    # Resolve walkover winners. "Walkover by X" means X's side
    # forfeited, so the other team wins.
    for match in matches:
        if match["status"] != "WALKOVER":
            continue

        text = match["walkover"].lower()
        actor = match["walkover"]

        m = re.search(r"walkover\s+by\s+(.+)", text)
        if m:
            actor_name = m.group(1).strip()

            # Match against either team using normalized strings.
            if re.sub(r"\s+", "", actor_name).lower() == re.sub(r"\s+", "", team_a).lower():
                match["winnerSide"] = "team_b"
            elif re.sub(r"\s+", "", actor_name).lower() == re.sub(r"\s+", "", team_b).lower():
                match["winnerSide"] = "team_a"

    # Team fixture winner = side winning the most individual matches.
    a_wins = sum(m["winnerSide"] == "team_a" for m in matches)
    b_wins = sum(m["winnerSide"] == "team_b" for m in matches)

    fixture_winner = (
        "team_a" if a_wins > b_wins
        else "team_b" if b_wins > a_wins
        else None
    )

    fixtures.append({
        "fixtureNumber": len(fixtures) + 1,
        "sourceDate": current_date,
        "category": category,
        "teamA": team_a,
        "teamB": team_b,
        "winnerSide": fixture_winner,
        "matches": [
            {
                "matchNumber": n,
                **m
            }
            for n, m in enumerate(matches, start=1)
        ]
    })

    # Normal fixture consumes two rows. The blank separator is skipped
    # naturally on the next iteration.
    i += 2

js = """// Generated from Match_Results_InterBatch_2025.xlsx - Results.csv
// Do not edit manually. Regenerate from the source CSV when needed.

const interBatch2025Fixtures = """ + json.dumps(
    fixtures, indent=2, ensure_ascii=False
) + """;

export default interBatch2025Fixtures;
"""

Path(OUTPUT).write_text(js, encoding="utf-8")

# Print validation summary
match_counts = {}
total_sets = 0
walkovers = 0

for f in fixtures:
    for m in f["matches"]:
        match_counts[m["matchType"]] = match_counts.get(m["matchType"], 0) + 1
        total_sets += len(m["sets"])
        if m["status"] == "WALKOVER":
            walkovers += 1

print(f"Generated: {OUTPUT}")
print(f"Fixtures: {len(fixtures)}")
print(f"Matches: {sum(match_counts.values())}")
print(f"Sets: {total_sets}")
print(f"Walkover matches: {walkovers}")
print("Match types:", match_counts)
