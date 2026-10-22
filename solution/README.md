# Practice Midterm - Solutions

The original exam folders (`part-b-practice-room/`, `part-c-pokemon-team/` one level
up) are untouched, so you can still practise on them. Everything solved is in here.

| File | What's in it |
|---|---|
| [part-a-answers.md](part-a-answers.md) | Answer key plus a full explanation for all 30 questions, including why each wrong option is wrong |
| [part-b-explanations.md](part-b-explanations.md) | For each of the 10 bugs: the symptom, the root cause, the fix (before/after), alternatives, and before/after test results |
| [part-b-practice-room/](part-b-practice-room/) | The fixed app, with a `FIX N` comment at every change |
| [part-c-explanations.md](part-c-explanations.md) | The design, each requirement's code explained, common mistakes, and a self-check list |
| [part-c-pokemon-team/](part-c-pokemon-team/) | The finished app (CSS at the bottom of `styles.css`, all of `app.js`) |

## Part A key

A1 b · A2 a,b,d · A3 b · A4 a · A5 b · A6 c · A7 b · A8 b · A9 b · A10 b ·
A11 a,b,e · A12 c · A13 c · A14 a,c,e · A15 b · A16 c · A17 b · A18 c · A19 b · A20 c ·
A21 b · A22 a · A23 a,b,c · A24 b · A25 b · A26 c · A27 b · A28 c · A29 c · A30 c

## How the solutions were checked

- **Part A:** every question that can be run was run.
  - JavaScript in Node 24.
  - CSS/DOM/security questions in a headless browser: computed styles, the
    accessibility tree, real clicks, XSS attempts, cookie behaviour.
  - npm ranges with npm's `semver`.
  - TypeScript with `tsc --strict`.
- **Part B:** `node --test` passes **15/15** (7 failed before). In the browser, all 10
  bugs were reproduced on the original and confirmed fixed in this version.
- **Part C:** 19 browser checks covering every requirement, plus screenshots at the
  three expected sizes (the layouts match).

## Run them yourself

```
cd solution/part-b-practice-room
node --test
python3 -m http.server 8000      # then open http://localhost:8000

cd ../part-c-pokemon-team
python3 -m http.server 8000
```

Open `http://localhost:8000`, not your network IP: `crypto.randomUUID()` in Part C
only works on `localhost` or https.
