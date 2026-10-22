# Practice Midterm - Part B: Practice Room, the 10 bugs explained

The fixed code is in [`part-b-practice-room/`](part-b-practice-room/). Every fix
has a `FIX N` comment next to it, and nothing in `test/` was touched.

| Bug | File | The fix |
|---|---|---|
| 1 | `lib.js` | `throw error;` at the end of the `catch` |
| 2 | `lib.js` | `>` becomes `>=` |
| 3 | `lib.js` | `return { ...song, daysSincePractised: 0 };` instead of changing `song` |
| 4 | `lib.js` | `counts[k] = (counts[k] ?? 0) + 1` |
| 5 | `lib.js` | `sort((a, b) => a.title.localeCompare(b.title))` |
| 6 | `app.js` | `createElement("button")` instead of `"span"` |
| 7 | `styles.css` | `--warn` moved from `header` to `:root` |
| 8 | `styles.css` | `flex-wrap: wrap` on `form` |
| 9 | `app.js` | `event.target.closest(".practise")?.dataset.title` |
| 10 | `app.js` | notice built with `createElement` + `textContent` instead of `innerHTML` |

**How it was checked:**
- `node --test`: **15/15 pass** (on the original, 7 tests failed, one or more in
  every Bug 1-5 group).
- A headless browser ran the same checks on the original and the fixed app. Each
  "Before / after" section below shows both results.

---

## How to find these fast in the exam

1. **Run `node --test` first.** The failing test names point straight at bugs 1-5,
   and the test file shows what each function should return.
2. **Read `lib.js` against its comments.** Each comment says what the function
   *should* do; the bug is wherever the code disagrees ("or more", "a NEW array",
   "rejects with").
3. **For page bugs, scan for the usual suspects:**
   - `innerHTML` with user data (XSS);
   - `event.target.something` with no `closest()`;
   - a `<span>`/`<div>` used as a button;
   - CSS variables defined somewhere other than `:root`;
   - `display: flex` without `flex-wrap` on a long row.

---

## Bug 1 - `loadSongs` swallows the error

**Symptom:** with `songs.json` missing, the page stays empty and the Console shows a
TypeError from `render`.

**Cause.** The original code:

```js
export async function loadSongs(url = "songs.json") {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(error);   // logs it... and then the function just ends
  }
}
```

The `catch` "handles" the error by logging it, and then the function finishes
normally. An `async` function that finishes without `return` **resolves with
`undefined`**. So in `app.js`:

```js
try {
  songs = await loadSongs();   // no error reaches here; songs = undefined
} catch (error) {
  message.textContent = ...;   // never runs
}
render();                      // needsPractice(undefined) -> undefined.filter -> TypeError
```

The comment above the function promises the opposite: *"Rejects with
Error("HTTP <status>") when the response is not OK."*

**Fix:** re-throw after logging, so the caller sees the failure:

```js
  } catch (error) {
    console.error(error);
    throw error; // FIX 1
  }
```

Now the promise rejects with `Error("HTTP 404")`. The `catch` in `app.js` shows
"Could not load songs: HTTP 404", `songs` keeps its starting value `[]`, and
`render()` draws an empty list without crashing.

**Alternative:** delete the `try`/`catch` completely. Errors then pass straight
through to the caller. Both versions pass the tests. Re-throwing is the smaller
change and keeps the log.

**Trap:** don't call `response.json()` *before* checking `response.ok`. The test's
fake 404 response has a body that isn't JSON (like a real server's HTML error
page), so you would get a `SyntaxError` instead of `"HTTP 404"`.

**Lesson:** catch an error where you can actually *do* something about it (here,
`app.js` shows a message). A helper function that catches and only logs hides the
failure from its caller.

**Before / after** (`songs.json` answering 404):

| | `#message` | Console |
|---|---|---|
| Original | *(empty)* | `TypeError: Cannot read properties of undefined (reading 'filter')` |
| Fixed | `Could not load songs: HTTP 404` | no errors |

---

## Bug 2 - `>` should be `>=`

**Cause:** `song.daysSincePractised > song.practiceEvery` means "*more* than", but the
comment says "practised `practiceEvery` **or more** days ago". Blackbird is 7 days
out of 7 and Seven Nation Army is 2 out of 2. Both are due exactly today, but
`7 > 7` is `false`.

**Fix:**

```js
return songs.filter((song) => song.daysSincePractised >= song.practiceEvery); // FIX 2
```

**Lesson:** this is an off-by-one bug at a boundary. Always test the exact boundary
value (here, "due *today*"); the test "includes a song that is due today" does just
that.

**Before / after** (Show: Needs practice): before, only *Clair de Lune*. After,
*Blackbird, Clair de Lune, Seven Nation Army*.

---

## Bug 3 - `withPractised` changes the original songs

**Cause:**

```js
return songs.map((song) => {
  if (song.title === title) {
    song.daysSincePractised = 0;   // changes the caller's object!
  }
  return song;
});
```

`map` does return a new array, but the objects in it are **the same objects** as in
the original array (Part A, A15). Setting `song.daysSincePractised` changes the song
in the caller's list too. The page looks fine, because it re-renders from the
changed data either way. But the function isn't pure, and the test "does not change
the original songs" fails.

**Fix:** make a **new object** for the song that changes, and return the others
untouched:

```js
if (song.title === title) {
  return { ...song, daysSincePractised: 0 }; // FIX 3
}
return song;
```

It's fine that the other songs are the same objects as before, because nothing
changed them. Only what changes needs a copy.

**Why it matters:** with shared, mutated objects, a change in one place silently
shows up elsewhere. An undo history or a "before" snapshot would change too, and
React-style "did this object change?" checks stop working.

---

## Bug 4 - `NaN guitar, NaN piano, NaN drums`

**Cause:** `counts` starts as `{}`. The first time an instrument appears,
`counts["guitar"]` is `undefined`, and `undefined + 1` is `NaN`. After that,
`NaN + 1` is still `NaN`, forever.

**Fix:** start from 0 when the key isn't there yet:

```js
counts[song.instrument] = (counts[song.instrument] ?? 0) + 1; // FIX 4
```

`??` (nullish coalescing) gives the right-hand side when the left is `undefined` or
`null`. `|| 0` works here too.

This is still a pure function: `counts` is a new object created inside the
function, so changing it affects nothing outside.

**Before / after** (summary):
- Before: `6 songs - 1 need practice - NaN guitar, NaN piano, NaN drums`
- After: `6 songs - 3 need practice - 2 guitar, 2 piano, 2 drums`

---

## Bug 5 - the sort comparator returns a boolean

**Cause:** `sort` needs a compare function that returns a **number**:

- negative if `a` comes first;
- positive if `b` comes first;
- `0` if they're equal.

`a.title > b.title` returns `true`/`false`, which `sort` treats as `1`/`0`. It
**never returns a negative number**, so the sort is never told "a goes before b".
In Chrome and Node (V8), the result is that nothing moves at all.

**Fix:**

```js
return [...songs].sort((a, b) => a.title.localeCompare(b.title)); // FIX 5
```

`localeCompare` returns a negative number, 0 or a positive number, and it orders
text the way a person expects (accents, upper/lower case). For numbers, use
`(a, b) => a.n - b.n`.

The `[...songs]` copy was already right and must stay. `sort` sorts **in place**,
so copying first keeps the function pure (A14 b).

**Before / after** (A-Z ticked):
- Before: still *Wonderwall, Blackbird, Clair de Lune, ...* (unchanged).
- After: *Back in Black, Blackbird, Clair de Lune, River Flows in You, Seven Nation
  Army, Wonderwall*.

---

## Bug 6 - a `<span>` pretending to be a button

**Cause:** `songCard` makes the Practised "button" with
`document.createElement("span")`. A `<span>`:
- is **not focusable**, so Tab skips it;
- does nothing on Enter or Space;
- has **no role**, so a screen reader doesn't say it's clickable. Its role is
  "generic", with no name.

**Fix (`app.js`):**

```js
const practise = document.createElement("button"); // FIX 6
```

A real `<button>` gets all of this for free:
- it's in the Tab order;
- Enter and Space fire a `click`, so the existing click listener now works for
  keyboard users too;
- it's announced as "Practised, button".

The `.practise` class still gives it the same look.

**Worse alternative:** `role="button"` + `tabindex="0"` + your own keydown handler for
Enter *and* Space. The "first rule of ARIA" is to use the native element when one
exists.

(It isn't needed here because these buttons are outside any form, but a `<button>`
*inside* a `<form>` defaults to `type="submit"`. Use `type="button"` there.)

**Before / after:**
- Pressing Tab from the top of the page:
  - **Original:** title → instrument → every → Add song → Show → A-Z → *(leaves the
    page)*.
  - **Fixed:** ... → A-Z → **Practised (Wonderwall) → Practised (Blackbird)** → ...
- Accessibility tree:
  - **Original:** role `generic`, no name.
  - **Fixed:** role `button`, name "Practised". (The 🎵 is `aria-hidden`, so it isn't
    read out.)
- Focusing a Practised button and pressing Enter marks that song practised.

---

## Bug 7 - `--warn` is defined in the wrong place

**Cause:**

```css
header {
  --warn: #c2410c;
}
```

Custom properties (CSS variables) **inherit down the tree**, like `color`. An element
can only see variables declared on itself or on its **ancestors**. `--warn` is
declared on `<header>`, but the cards live inside `<main>`, which is `<header>`'s
*sibling*. So for the cards, `--warn` doesn't exist.

When `var()` names a variable that doesn't exist (and has no fallback), the
declaration becomes **"invalid at computed-value time"**, and the property falls back
to its initial value. For `border-left` that's `medium none currentcolor`: *no border
at all*. So the due cards didn't just miss the orange stripe; they lost their left
border entirely.

**Fix (`styles.css`):** declare it on `:root` (the `<html>` element, the ancestor of
everything), next to the other variables. The old `header { ... }` block is removed.

```css
:root {
  /* ... */
  --accent: #4b3f8a;
  --warn: #c2410c; /* FIX 7 */
}
```

A fallback like `var(--warn, #c2410c)` would hide the symptom, not fix the cause.

**Debug tip:** in DevTools → Elements → Styles, `var(--warn)` on a card shows as
undefined. The Computed tab shows the left border as `0px none`.

**Before / after** (computed style of a due card):

| | Card | `border-left` |
|---|---|---|
| Original | Clair de Lune (has class `due`!) | `0px none` |
| Fixed | Blackbird | `6px solid rgb(194, 65, 12)` |

---

## Bug 8 - the Add form runs off a phone screen

**Cause:** `form { display: flex; }` puts all seven children on **one line**: 3
labels, 2 inputs, 1 select, 1 button. `flex-wrap` defaults to `nowrap`, and flex
items don't shrink below their minimum content size. A text input's default width is
about 20 characters, so it barely shrinks. The row ends up much wider than a phone,
and the page scrolls sideways. The `.controls` row just below has
`flex-wrap: wrap`, which is why it was fine.

**Fix:**

```css
form {
  display: flex;
  flex-wrap: wrap; /* FIX 8 */
  align-items: center;
  gap: 0.5rem;
}
```

Items that don't fit now move to the next line.

**Before / after** (375px-wide phone):
- Original: the page is **776px** wide (the form's right edge is at 776px).
- Fixed: the page is **375px** wide, with no sideways scroll. The form wraps onto
  three lines.

**Debug tip:** to find what's too wide, temporarily add `* { outline: 1px solid red; }`,
or look in DevTools' Elements panel for the box sticking out past the viewport.

---

## Bug 9 - clicking the 🎵 does nothing

**Cause:**

```js
list.addEventListener("click", (event) => {
  const title = event.target.dataset.title;
  if (!title) return;
```

The button contains two things: `<span aria-hidden="true">🎵</span>` and the text
`" Practised"`. `event.target` is the **innermost element** that was clicked (A19):
- **Clicking the word:** text isn't an element, so the target is the button itself.
  It has `data-title`, so it works.
- **Clicking the 🎵:** the target is the inner `<span>`. That has no `data-title`, so
  `title` is `undefined` and the handler returns.

**Fix:** walk up from the target to the element that has the data:

```js
const title = event.target.closest(".practise")?.dataset.title; // FIX 9
```

`closest(selector)` returns the element itself or its nearest ancestor that matches,
or `null`. `?.` handles that `null` (e.g. a click on the card background) and gives
`undefined`, so the existing `if (!title) return;` still works. This fix doesn't
depend on Bug 6: `.practise` matches whether the element is a `<span>` or a
`<button>`.

**Alternative:** `.practise span { pointer-events: none; }` makes clicks go "through"
the emoji to the button. It works, but `closest()` is the standard event-delegation
pattern, and it's what Part C needs too.

**Before / after** (a real mouse click on the 🎵 of *Back in Black*):
- In both versions, `event.target` was `<span aria-hidden="true">🎵</span>`.
- Original: still "practised 9 days ago".
- Fixed: "practised **0** days ago".

---

## Bug 10 - XSS through the notice (not the cards)

**Cause:**

```js
notice.innerHTML = `Added <strong>${song.title}</strong>.`;
```

The cards are safe, because `songCard` only uses `textContent`. But this line puts the
**user's title into `innerHTML`**, which parses it as HTML. The title
`<img src=x onerror="alert('pwned')">` becomes a real `<img>` element, `src=x` fails
to load, and its `onerror` runs the attacker's code.

(A `<script>` tag inserted with `innerHTML` does *not* run, but event-handler
attributes do. That's why `<img onerror>` is the classic payload.)

**Fix:** build the same structure with DOM methods, putting the title in with
`textContent`:

```js
// FIX 10
const strong = document.createElement("strong");
strong.textContent = song.title;
notice.replaceChildren("Added ", strong, ".");
```

`replaceChildren` removes the old notice and inserts the new nodes. Plain strings
become text nodes. The title is shown exactly as typed, still in bold.

**Simpler alternative** (loses the bold): `` notice.textContent = `Added ${song.title}.`; ``

**Before / after** (adding the title from the bug report):

| | Alert? | What `#notice` contains |
|---|---|---|
| Original | **yes, "pwned"** | a real `<img src="x" onerror="alert('pwned')">` element |
| Fixed | no | the text `Added <img src=x onerror="alert('pwned')">.` |

**Why it matters:** right now it's "self-XSS" (you can only attack yourself). But as
soon as songs are saved on a server and shown to other users, the same line lets one
user run code in everyone else's browser. And as A29 shows, that code can then act
as them.
