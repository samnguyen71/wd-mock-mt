# Practice Midterm - Part C: Pokémon Team, explained

The finished code is in [`part-c-pokemon-team/`](part-c-pokemon-team/). The CSS is
added at the bottom of `styles.css`, the JavaScript is in `app.js`, and `index.html`
is untouched.

**How it was checked:**
- A headless browser ran **19 automated checks**, covering every requirement in the
  table: the grid at and around each breakpoint, colours, opacity, card structure,
  add, train, filter, the summary, the load failing (both a 404 and a dropped
  connection), and "exactly one click listener".
- Screenshots at the same sizes as `expected-*.png` (1100px, 768px, 390px) match the
  layouts: 3, 2 and 1 columns.

The only visible difference is the font. `system-ui` is Segoe UI on Windows but a
different font on the Linux machine that made the screenshots. That changes text
widths slightly; for example, on the phone the word "Type" wraps onto a different
line. That isn't a CSS difference.

---

## The big idea: one array + one `render()`

The whole app follows one pattern, and every requirement fits into it:

```
         ┌───────────── user does something (load, add, train, filter)
         ▼
  team = a NEW array           (never push, never change an object)
         │
         ▼
      render()                 rebuilds every card + the summary from `team`
```

- `let team = [];` is the **single source of truth**. The DOM is only a picture of it.
- Every change **replaces** `team` with a new array (spread, `map`), then calls
  `render()`.
- `render()` throws the old cards away (`replaceChildren()`) and builds new ones. So
  it doesn't matter what was on screen before. The cards always match `team`.

---

## Requirement 1 - CSS (6 marks)

```css
/* 1. Mobile first: one column by default... */
#team-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* ...two columns from 40rem... */
@media (min-width: 40rem) {
  #team-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ...three from 64rem. This query comes last, so it wins when both match. */
@media (min-width: 64rem) {
  #team-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Each badge gets its type's colour. */
.badge.fire  { background: var(--fire); }
.badge.water { background: var(--water); }
.badge.grass { background: var(--grass); }

/* A Pokémon that was trained today is drawn faded. */
.card.trained {
  opacity: 0.6;
}
```

(In the file, each badge rule is spread over three lines. It's compressed here to
save space.)

**Why it's written this way:**
- **Mobile first** means the rules *outside* any media query are the phone layout.
  `min-width` queries then *add* columns as the screen gets wider.
- **The order of the queries matters** (A7). At 70rem both queries match, and they
  have the same specificity, so the *last* one wins. 40rem must come before 64rem.
  Swap them and desktop shows 2 columns.
- `repeat(2, 1fr)` means two equal columns. `gap: 1rem` (16px) matches the spacing
  in the screenshots.
- `rem` inside a media query always uses the browser's default font size (16px), so
  40rem = 640px and 64rem = 1024px.
- `.badge.fire` has specificity (0,2,0), so it beats `.badge` (0,1,0) and its grey
  background.
- The JavaScript makes the type the badge's class name (`badge fire`), and that's
  what ties JS and CSS together. The colour variables already exist in `:root`.
- `opacity` fades the **whole card, children included**. That's why the badge, text
  and button are all faded in the screenshot, and why the white card looks slightly
  grey: the page background shows through.

**Checked:** columns by viewport width were 390px → 1, 639px → 1, **640px → 2**,
768px → 2, 1023px → 2, **1024px → 3**, 1100px → 3. The badges computed to the exact
`--fire`/`--water`/`--grass` colours. Charmander and Psyduck had opacity `0.6`.

**Mistakes that lose marks here:**
- Forgetting `display: grid`. The given CSS only removes the list bullets.
- Writing the queries largest-first.
- Using `max-width` queries. That's desktop-first, and the spec says mobile first.
- Putting the opacity on the button instead of the card.

---

## Requirement 2 - Loading with async/await (5 marks)

```js
async function loadTeam() {
  try {
    const response = await fetch("pokemon.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    team = await response.json();
  } catch (error) {
    console.error(error);
    message.textContent = "Could not load the team.";
  }
  render();
}

loadTeam();   // called on the last line, after the listeners are set up
```

**Why:**
- `fetch` **resolves even for a 404 or 500** (A18), so check `response.ok` yourself
  and throw. This makes "not OK" end up in the same `catch` as a real network
  failure.
- `await response.json()` needs the `await` (A17). Without it, `team` would be a
  Promise.
- One `catch` covers every way loading can fail:
  - no connection (`fetch` rejects);
  - not OK (our own `throw`);
  - broken JSON (`.json()` rejects).
- If loading fails, `team` stays `[]`. `render()` runs **either way**, so the
  summary shows `0 Pokémon - 0 trained today - highest level 0`.
- **"The rest of the page still works"** for two reasons:
  1. The submit, click and change listeners are set up when the module runs, and
     they don't depend on whether loading worked.
  2. `render()` copes with an empty array, because the `reduce` has an initial value
     (A13).

**Test it like the examiners will:** temporarily rename `pokemon.json`. Or in
DevTools → Network, right-click the request → *Block request URL*, or set the
throttling to *Offline*.

**Checked:** with `pokemon.json` answering 404, *and* with the connection dropped,
the page showed `Could not load the team.`, an all-zero summary, and adding "Eevee"
still worked (`1 Pokémon - 0 trained today - highest level 1`).

**Mistakes:**
- Skipping the `ok` check. Python's 404 page is HTML, so `.json()` would throw and
  get caught anyway, but only by luck; a server that sent a JSON error body would
  break it.
- Setting up the listeners *inside* the success path, so adding doesn't work when
  loading fails.
- Using `.then()` chains when the spec says async/await.

---

## Requirement 3 - Rendering the cards (7 marks)

```js
function pokemonCard(pokemon) {
  const li = document.createElement("li");
  li.className = pokemon.trainedToday ? "card trained" : "card";

  const name = document.createElement("h3");
  name.textContent = pokemon.name;

  const badge = document.createElement("span");
  badge.className = `badge ${pokemon.type}`;
  badge.textContent = pokemon.type;

  const level = document.createElement("p");
  level.textContent = `Level ${pokemon.level}`;

  const train = document.createElement("button");
  train.textContent = "Train";
  train.dataset.id = pokemon.id;
  train.disabled = pokemon.trainedToday;

  li.append(name, badge, level, train);
  return li;
}
```

This produces, for example:

```html
<li class="card trained">
  <h3>Charmander</h3>
  <span class="badge fire">fire</span>
  <p>Level 12</p>
  <button data-id="p1" disabled>Train</button>
</li>
```

**Why:**
- **`textContent`, never `innerHTML`.** The name comes from the user. A name like
  `<b>Pikachu</b>` must show up as those exact characters, not as bold text (and
  `<img onerror=...>` must not run, as in Part B Bug 10).
- The badge text is the raw type (`fire`). The provided CSS has
  `text-transform: capitalize`, which shows it as "Fire", just like the screenshot.
- `train.dataset.id = pokemon.id` writes the `data-id="p1"` attribute. Requirement 5
  reads it back.
- `train.disabled = pokemon.trainedToday` sets the boolean property. The provided CSS
  already greys out `button:disabled`.
- The `trained` class (requirement 1) is added here, from the same data.
- The children are appended in the order the screenshot shows: name, badge, level,
  button.

**Checked:** every card is `li.card > h3, span.badge.TYPE, p "Level N", button
"Train"` with a `data-id`. `app.js` contains no `innerHTML`.

---

## Requirement 4 - Adding a Pokémon (5 marks)

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const pokemon = {
    id: crypto.randomUUID(),
    name: data.get("name"),
    type: data.get("type"),
    level: 1,
    trainedToday: false,
  };
  team = [...team, pokemon];
  form.reset();
  render();
});
```

**Why:**
- Listen for `submit` on the **form**, not `click` on the button. That way pressing
  Enter works too, and the `required` attribute stops an empty name before your code
  runs.
- `event.preventDefault()` stops the browser's normal form submission. That would
  reload the page and throw away `team`.
- `new FormData(form)` reads the fields by their `name` attributes (`name="name"`,
  `name="type"`).
- `crypto.randomUUID()` gives a random unique id like
  `02e3648e-92d3-4416-b5cc-eb5a148dafb2`. It only works in a **secure context**:
  `http://localhost` or `127.0.0.1` (and https) are fine. If you open the page through
  your network IP (e.g. `http://192.168.1.5:8000`), it's `undefined` and adding
  crashes. Use `localhost`.
- `team = [...team, pokemon]` makes a **new array**. The spec says no `push`, because
  `push` changes the existing array.
- `form.reset()` empties the input and sets the select back to Fire.

**Checked:** after adding `<b>Pikachu</b>`:
- the page did not reload;
- the card showed the literal text `<b>Pikachu</b>` (with no `<b>` element inside);
- it had `badge water`, `Level 1`, an enabled button and a UUID `data-id`;
- the form was reset;
- the summary went to `7 Pokémon - ...`.

---

## Requirement 5 - Train, with event delegation (4 marks)

```js
list.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  team = team.map((pokemon) =>
    pokemon.id === button.dataset.id
      ? { ...pokemon, level: pokemon.level + 1, trainedToday: true }
      : pokemon,
  );
  render();
});
```

**Why:**
- **One listener on the `<ul>`.** Clicks on the buttons bubble up to it. This matters
  even more here because `render()` creates brand-new buttons every time. Listeners on
  individual buttons would be thrown away with them and would have to be re-added on
  every render.
- `event.target.closest("button")` finds the button even if the click lands on
  something inside it (A19, Part B Bug 9). `if (!button) return;` ignores clicks on
  the card background.
- `map` returns a **new array**. For the clicked Pokémon,
  `{ ...pokemon, level: pokemon.level + 1, trainedToday: true }` makes a **new
  object**. Properties written after the spread overwrite the copied ones. The
  original object is never changed (no `pokemon.level++`). The others are returned
  as they are.
- `button.dataset.id` is a string, and the ids are strings (`"p1"`, UUIDs), so `===`
  works.
- **Disabled buttons don't fire click events**, so a Pokémon can't be trained twice
  in one day.

**Checked:** a real mouse click on Squirtle's Train button made the card
`card trained`, `Level 6`, disabled, and the summary went to `3 trained today`.
Clicking Charmander's disabled button left it at `Level 12`. The browser reported
**exactly one `click` listener on `#team-list` and none on the buttons**.

---

## Requirement 6 - Filter and summary (3 marks)

```js
function render() {
  // The Show menu decides which cards are drawn...
  const visible =
    filter.value === "all" ? team : team.filter((pokemon) => pokemon.type === filter.value);

  list.replaceChildren();
  for (const pokemon of visible) {
    list.append(pokemonCard(pokemon));
  }

  // ...but the summary always counts the whole team.
  const trained = team.filter((pokemon) => pokemon.trainedToday).length;
  const highest = team.reduce((max, pokemon) => Math.max(max, pokemon.level), 0);
  summary.textContent = `${team.length} Pokémon - ${trained} trained today - highest level ${highest}`;
}

filter.addEventListener("change", render);
```

**Why:**
- `visible` is used **only for drawing**. The summary uses `team`, the whole team, as
  required.
- `filter` never changes `team`. It makes a new, shorter array just for this render.
  Picking "All" again shows everything, because nothing was lost.
- The `select`'s option values (`fire`, `water`, `grass`) are exactly the `type`
  values, so a plain `===` works.
- `reduce((max, p) => Math.max(max, p.level), 0)` keeps the biggest level seen so far.
  The **initial value `0`** keeps it working on an empty team (A13). Without it,
  `reduce` throws when loading fails, and requirement 2 breaks too.
- The `change` event on the select just calls `render()`, because `render()` reads
  `filter.value` itself.

**Checked:**
- Show: Fire gives *Charmander, Vulpix*.
- Show: Water gives *Squirtle, Psyduck, `<b>Pikachu</b>`*.
- While filtered, the summary still said `7 Pokémon - 3 trained today - highest level 30`.
- On load, the summary is exactly `6 Pokémon - 2 trained today - highest level 30`.

---

## Self-check list before you zip (exam habit)

- [ ] Desktop (wide window) shows 3 columns, ~800px shows 2, and the phone view in
      DevTools shows 1.
- [ ] Badges are orange-red, blue and green. Charmander and Psyduck are faded with
      grey, disabled buttons.
- [ ] Summary: `6 Pokémon - 2 trained today - highest level 30`.
- [ ] Add `<b>Pikachu</b>`: the tags show as text, the page doesn't reload, and the
      input empties.
- [ ] Train someone: their level +1, the card fades, the button disables, the summary
      updates.
- [ ] Show: Fire shows only fire, and the summary still counts everyone.
- [ ] Rename `pokemon.json` and reload: you see `Could not load the team.`, and you
      can still add. **Rename it back!**
- [ ] Console (F12): no red errors.
- [ ] Zip the **whole folder**.
