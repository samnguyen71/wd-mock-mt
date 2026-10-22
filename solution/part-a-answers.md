# Practice Midterm - Part A: Answers and explanations

Every answer below was also checked by running it: the JavaScript in Node 24,
the CSS/DOM questions in a real browser (Edge, headless), the npm range with npm's
own `semver` package, and the TypeScript questions with `tsc` 5.6 in strict mode.
The **Checked** line under each answer says what happened.

## Answer key

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| A1 | b | A11 | a, b, e | A21 | b |
| A2 | a, b, d | A12 | c | A22 | a |
| A3 | b | A13 | c | A23 | a, b, c |
| A4 | a | A14 | a, c, e | A24 | b |
| A5 | b | A15 | b | A25 | b |
| A6 | c | A16 | c | A26 | c |
| A7 | b | A17 | b | A27 | b |
| A8 | b | A18 | c | A28 | c |
| A9 | b | A19 | b | A29 | c |
| A10 | b | A20 | c | A30 | c |

---

## 01a The web & HTTP

### A1 - **b) The password ends up in the URL**

With `method="get"`, the browser puts the form fields into the **query string** of
the URL it goes to: `/login?username=sam&password=hunter2`. URLs are not treated as
secret. They are saved in the browser history and autocomplete, written to the
server's access logs (and any proxy or CDN logs), shown in the address bar, kept in
bookmarks, and can leak to other sites in the `Referer` header. HTTPS encrypts the
URL while it travels, but it doesn't stop it being stored at either end. With
`method="post"` the fields travel in the request **body** instead.

- a) Wrong - GET *does* carry form data, in the URL. That is exactly the problem.
- c) Wrong - HTTPS works with every method.
- d) Wrong - GET is for requests that only read (search, filter). Anything that sends
  secrets or changes something (log in, create, delete) should be POST.

**Checked:** submitting a GET form in the browser went to
`.../a1-done.html?username=sam&password=hunter2`.

### A2 - **a, b, d**

The first digit gives the class: 1xx info, **2xx success**, **3xx redirect**,
**4xx the client's request was wrong**, **5xx the server failed**.

- a) **True.** `201 Created` = "your POST worked and created something" (often with
  a `Location` header pointing at the new thing).
- b) **True.** `401` = not *authenticated*: no login, or an invalid/expired one.
  Log in and try again. (The name "Unauthorized" is historical. It really means
  "unauthenticated".)
- c) False. `403 Forbidden` = "I know who you are (or it doesn't matter), and you
  are not allowed." A server that's down sends no answer at all (`fetch` rejects), or
  a proxy answers `502`/`503`/`504`.
- d) **True.** `301`/`308` permanent, `302`/`307` temporary, `303` See Other,
  `304` Not Modified (your cached copy is still good).
- e) False. `404` means the server is working fine and answered: there's nothing at
  that URL. A crash is `500 Internal Server Error`.

> 401 = "who are you?" - 403 = "I know who you are, and no."

---

## 01b HTML & CSS

### A3 - **b) `<button aria-label="Delete">🗑</button>`**

A button's **accessible name** is what a screen reader announces ("Delete,
button"). Normally it comes from the button's text. Here the only "text" is an
emoji, so the button needs a real name, and `aria-label` provides one.

- a) The browser builds the button's name from its content. The content (🗑) is not
  empty, so the `title` is never used. `title` is only a last-resort fallback, and
  as a tooltip it only appears on mouse hover, so keyboard and touch users never see it.
- c) `alt` is only valid on `<img>`, `<area>` and `<input type="image">`. On a
  button it is just ignored.
- d) `name` is the key the button's value is submitted under in a form. It has
  nothing to do with the accessible name.

**Checked:** in the browser's accessibility tree, only b) is named "Delete". a),
c) and d) are all named "🗑".

Another good option is visually-hidden text, with the emoji hidden from screen
readers: `<button><span aria-hidden="true">🗑</span><span class="visually-hidden">Delete</span></button>`.
Part B uses the `aria-hidden` half of this for its 🎵.

### A4 - **a) Blue**

Specificity is compared column by column, left to right: (IDs, classes, elements).

| Selector | IDs | Classes | Elements |
|---|---|---|---|
| `#list li` | **1** | 0 | 1 |
| `.card.done` | 0 | 2 | 0 |
| `li.card.done` | 0 | 2 | 1 |

`#list li` is the only rule with an ID, so it wins straight away. No number of
classes adds up to one ID. Source order only matters when specificity is *equal*.

- b), c) Without the ID rule, `li.card.done` (0,2,1) would beat `.card.done`
  (0,2,0), and the text would be red.
- d) The cascade always decides. A browser never gives up on a conflict.

**Checked:** computed colour `rgb(0, 0, 255)`.

### A5 - **b) padding 20px, margin 16px**

- `em` is relative to the element's **own** font size. The `<p>` doesn't set one,
  so it inherits 20px from `.card`, and `1em` = **20px**.
- `rem` ("root em") is always relative to the **root** `<html>` font size, so `1rem`
  = **16px** wherever it is used.

Gotcha: when `em` is used *in* `font-size` itself, it is relative to the
**parent's** font size. That's why nested `font-size: 1.2em` keeps growing.

**Checked:** computed `padding 20px, margin 16px`.

### A6 - **c) 224px**

With `box-sizing: content-box` (the browser default), `width` sets **only the
content**. Padding and border are added outside it:

```
content   50% of 400px  = 200px
padding   10px + 10px   =  20px
border     2px +  2px   =   4px
                          -----
border to border          224px
```

With `box-sizing: border-box` (which Parts B and C set on `*`), `width` would
include padding and border, so the box would be exactly 200px wide.

- a) 200px is the content only.
- b) 220px forgets the borders.
- d) 244px counts the padding twice.

**Checked:** `getBoundingClientRect().width` = 224.

---

## 02b Responsive design & CSS frameworks

### A7 - **b) 2**

At 70rem **both** media queries match (70 ≥ 64 and 70 ≥ 40). Media queries add no
specificity. Both rules are just `.grid` (0,1,0), so the tie goes to **source
order**: the last matching rule wins. The last rule is the 40rem one, so 2 columns.
The 3-column rule can never win.

**Fix:** with `min-width` (mobile-first) queries, write them from **smallest to
largest**. Part C needs exactly this.

- a) 1 column only happens below 40rem, when neither query matches.
- c) 3 is what the author meant, but the order breaks it.
- d) Rules don't add up. Each one replaces `grid-template-columns`.

**Checked:** at 1120px (70rem) the question's grid has 2 columns. With the two
queries swapped it has 3.

### A8 - **b)**

Without the viewport tag, a phone assumes the page was made for desktop. It lays the
page out in a virtual viewport about **980px** wide and then zooms out to fit the
screen. Media queries see that 980px width, not the real ~390px. So `min-width`
queries up to 980px match, and everything is drawn tiny.
`<meta name="viewport" content="width=device-width, initial-scale=1">` tells the
browser to use the device's real width.

- a) It's the other way round: desktops ignore the tag. It only matters on phones and tablets.
- c) The page loads fine. It's just shrunk.
- d) Media queries still run, but against the wrong (980px) width.

**Checked** (emulated 390px phone): without the tag, layout width 980px and
`(min-width: 40rem)` matches. With the tag, 390px and it doesn't. (980px = 61.25rem,
so a 64rem query still wouldn't match. "As if on a desktop" is approximate, but b
is clearly the right answer.)

### A9 - **b) 200px**

Fixed tracks are sized first, then `fr` units share **what's left**:

```
900px - 300px = 600px left over
1fr + 2fr     = 3 shares  ->  1fr = 200px
columns: 300px | 200px | 400px
```

- c) 400px is the third column (2fr).
- d) 1/3 of 900px would be `1fr 1fr 1fr`.

A `gap` would also be subtracted before sharing out; here there's none.

**Checked:** computed `grid-template-columns: 300px 200px 400px`.

---

## 03a JavaScript fundamentals

### A10 - **b) `Emma`**

Objects are handled **by reference**. `const copy = book` copies the reference, not
the object, so `copy` and `book` are two names for the **same** object. Changing
`copy.title` changes that one object.

- c) `const` only stops you **reassigning the variable** (`book = {}` would throw
  `TypeError: Assignment to constant variable`). It doesn't freeze the object (that's
  `Object.freeze`).
- A real (shallow) copy would be `const copy = { ...book };`.

**Checked in Node:** `Emma`.

### A11 - **a, b, e**

There are exactly eight falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`,
`undefined`, `NaN`. **Everything else is truthy.**

- c) `"0"` is a non-empty string, so it's truthy (so are `"false"` and `" "`).
- d) `[]` is an object, so it's truthy (so is `{}`). To test for an empty array, use
  `arr.length === 0`.

**Checked in Node:** `0 falsy | "" falsy | "0" truthy | [] truthy | null falsy`.

### A12 - **c) `"38"`**

1. Precedence: `*` binds tighter than `+`, so `4 * 2` = `8` first.
2. `"3" + 8`: if either side of `+` is a string, `+` **concatenates**, giving `"38"`
   (a string).

- d) `"342"` is what `"3" + 4 + 2` gives (left to right: `"34"`, then `"342"`).
- a) `11` needs a real number: `Number("3") + 4 * 2`.
- b) `14` would be `(3 + 4) * 2`.

`-`, `*` and `/` always convert to numbers: `"3" - 1` is `2`, but `"3" + 1` is `"31"`.

**Checked in Node:** `"38"` (string).

---

## 03b Functional patterns & modules

### A13 - **c) It throws a TypeError**

Without an initial value, `reduce` uses the **first element** as the starting
accumulator. An empty array has no first element, so it throws
`TypeError: Reduce of empty array with no initial value`. With an initial value it's
fine: `[].reduce((sum, n) => sum + n, 0)` is `0`.

Make it a habit to always pass the initial value. Part C depends on it: when
`pokemon.json` fails to load, the team is empty, and
`team.reduce((max, p) => Math.max(max, p.level), 0)` must still work.

**Checked in Node:** exactly that message. With `, 0` the result is `0`.

### A14 - **a, c, e**

A pure function only computes a result from its inputs. It doesn't change anything
outside itself, **including its arguments**.

- a) `[...list, x]` builds a new array. **Pure.**
- b) `sort()` sorts **in place** and returns the same array, so it mutates `list`.
  Not pure. Use `[...list].sort()` or `list.toSorted()`.
- c) `{ ...book, read: true }` builds a new object. **Pure.**
- d) `book.read = true` changes the caller's object. Not pure.
- e) `map` returns a new array, and every element is a new object, so neither the
  array nor its objects change. **Pure.** Compare
  `list.map((b) => { b.read = true; return b; })`: that's a new array full of
  *mutated* objects. That is exactly Part B Bug 3.

**Checked in Node:** a, c and e leave their arguments unchanged. b and d change them.

### A15 - **b) `2`**

Spread makes a **shallow** copy. `b` is a new array, but its one element is the
**same object** that `a` holds, so `b[0].n = 2` changes that shared object.

**Checked in Node:** `a === b` is `false`, but `a[0] === b[0]` is `true`.

For a deeper copy, use `a.map((o) => ({ ...o }))` or `structuredClone(a)`.

---

## 04a Asynchronous JavaScript

### A16 - **c) 1 4 3 2**

1. All the synchronous code runs first, top to bottom. It logs **1**, schedules the
   timer (a *task*), schedules the `.then` callback (a *microtask*), and logs **4**.
2. When the script finishes, the event loop **empties the microtask queue** before
   doing anything else, so **3**.
3. Only then does it run the next task, the timer: **2**.

`setTimeout(fn, 0)` means "as a new task, after at least 0ms", not "now". Promise
callbacks always get in before the next timer.

**Checked in Node:** `1 4 3 2`.

### A17 - **b) `undefined`**

`response.json()` returns a **Promise**, because reading and parsing the body takes
time. Without `await`, `books` is that Promise, and Promises have no `length`, so you
get `undefined`. Reading a property that doesn't exist isn't an error, so nothing
throws.

Fix: `const books = await response.json();`

**Checked in Node:** `books.length = undefined`, `books instanceof Promise` is
`true`, and with `await` it's `6`.

### A18 - **c) The server isn't running**

`fetch` rejects **only when no HTTP response arrives at all**: the server is down,
the connection is refused, DNS fails, you're offline, CORS blocks it, or the request
is aborted. *Any* response, including 404 and 500, counts as a successful fetch. It
resolves with `response.ok === false` and `response.status` set. That's why you have
to check `response.ok` yourself (Part B Bug 1, Part C requirement 2).

- d) With invalid JSON, `fetch` itself succeeded. It's the *later*
  `response.json()` that rejects (with a `SyntaxError`).

**Checked in Node:** 404 resolves (`ok=false`). 500 resolves (`ok=false`). No server
rejects (`TypeError: fetch failed`). Bad JSON: `fetch` resolves, `.json()` rejects.

---

## 04b The DOM & events

### A19 - **b) target: the `<span>`, currentTarget: the `<ul>`**

- `event.target` is where the event **started**: the innermost element that was
  clicked, the `<span>`.
- `event.currentTarget` is the element whose **listener is running right now**: the
  `<ul>`. The event bubbled up span → button → li → ul.

That's why event delegation uses `event.target.closest("button")`: the target may be
something *inside* the button. Part B Bug 9 is exactly this bug.

**Checked in the browser** with a real mouse click: `target=SPAN currentTarget=UL`.

### A20 - **c) `button.dataset.bookId`**

`data-*` attributes show up in `element.dataset` with `data-` removed and the
kebab-case name turned into **camelCase**: `data-book-id` becomes `dataset.bookId`.
The value is **always a string** (`"7"`), so use `Number(button.dataset.bookId)` if
you need a number.

- a) `button.dataset.book-id` is read as `button.dataset.book - id`, a subtraction:
  `ReferenceError: id is not defined`.
- b) `dataset["book-id"]` is `undefined`, because the key is `bookId`.
  (`button.getAttribute("data-book-id")` would work.)
- d) There's no `data` property, so it's `undefined.bookId`: `TypeError`.

**Checked in the browser:** exactly those four results.

### A21 - **b) The script runs before the `<body>` is parsed**

A classic `<script>` (no `defer`, not a module) **stops the HTML parser**: the
browser downloads it and runs it immediately. In the `<head>`, that's before the
`<body>` exists. So `querySelector("#list")` returns `null`, and `null.append(...)`
throws "Cannot read properties of null (reading 'append')".

Fixes:
- add `defer` (runs after the whole document is parsed);
- use `type="module"` (deferred automatically, which is why Parts B and C can keep
  their scripts in the `<head>`);
- or put the script at the end of `<body>`.

- a) `querySelector` takes a CSS selector, so `#list` is right.
  (`getElementById("list")` is the one without `#`.)
- c) `append` works on any element.
- d) Head scripts can use the DOM. The elements just have to exist first.

**Checked in the browser:** without `defer`, exactly that TypeError and nothing
added. With `defer`, no error and the item is added.

---

## 05a Libraries & tooling

### A22 - **a) 3.4.9**

- `~3.4.2` (tilde) allows **patch** updates only: `>=3.4.2 <3.5.0`.
- `^3.4.2` (caret, npm's default) allows **minor + patch** updates: `>=3.4.2 <4.0.0`.

| Version | `~3.4.2` | `^3.4.2` |
|---|---|---|
| 3.4.9 | **yes** | yes |
| 3.5.0 | no | yes |
| 4.0.0 | no | no |
| 3.3.9 | no (below 3.4.2) | no |

**Checked** with npm's own `semver` package: exactly this table.

### A23 - **a, b, c**

- a) **True.** Vite is a build tool. It runs on your machine (and in CI); the
  browser never downloads it. `dependencies` are what the app needs when it runs (like
  `marked`). `devDependencies` are tools (Vite, TypeScript, test runners). Install
  with `npm install -D vite`.
- b) **True.** `npm ci` ("clean install") deletes `node_modules` and installs
  **exactly** what `package-lock.json` says. It fails if `package.json` and the lock
  file disagree. Use it in CI and for reproducible builds.
- c) **True.** `npm run build` runs `vite build`, which writes the optimized site to
  `dist/`. That folder is what you deploy.
- d) False. `"marked"` is a **bare specifier**. Browsers only understand URLs
  (`./lib.js`, `/lib.js`, `https://...`) and know nothing about `node_modules`. You
  need a bundler (Vite rewrites the import) or an import map. Otherwise you get:
  *Failed to resolve module specifier "marked". Relative references must start with
  either "/", "./", or "../".*

---

## 05b TypeScript

### A24 - **b) An error: narrow `x` first**

On a union type, TypeScript only lets you use members that exist on **every** type
in the union. `toUpperCase` exists on `string` but not on `number`, so this is a
compile-time error. Narrow first:

```ts
function label(x: string | number) {
  return typeof x === "string" ? x.toUpperCase() : String(x);
}
```

Inside the `typeof x === "string"` branch, TypeScript knows `x` is a `string`.

- a) "Might be a string" isn't enough, because it might also be a number.
- c) Catching this at compile time is the whole point of TypeScript.
- d) Union types are fine as parameters.

**Checked with tsc:** `error TS2339: Property 'toUpperCase' does not exist on type
'string | number'. Property 'toUpperCase' does not exist on type 'number'.` The
narrowed version compiles.

### A25 - **b) `string | undefined`**

`?` makes the property **optional**: it may be missing, and reading a missing
property gives `undefined`. So `book.cover` is `string | undefined`, and TypeScript
makes you handle the `undefined` case, e.g. `book.cover ?? "placeholder.png"` or
`if (book.cover) { ... }`.

- d) `null` is a different value. TypeScript only allows it if you write
  `string | null`.
- c) A type is never `any` unless you write `any`.

**Checked with tsc:** assigning `book.cover` to a `string` variable gives
`Type 'string | undefined' is not assignable to type 'string'`.

### A26 - **c) Nothing catches it**

Types exist **only at compile time**. `tsc` erases them, so the JavaScript that
actually runs has no `Book` interface at all. `as Book[]` is a **type assertion**:
"trust me, this is a `Book[]`." `response.json()` is typed as returning `any`, so
TypeScript can't know what's in the file and accepts the assertion. At run time
`pages` is still the string `"300"`. So `book.pages + 10` gives `"30010"`, while
TypeScript believes it's a number.

To be safe, check or convert the data at run time, e.g. `pages: Number(raw.pages)`,
or use a validation library like Zod.

- a) TypeScript never sees the JSON file.
- b) Nothing converts types automatically.
- d) `"300"` is perfectly valid JSON.

**Checked:** `tsc --strict` reports no error for this code. At run time,
`typeof pages` is `"string"` and `pages + 10` is `"30010"`.

---

## 06a Web security

### A27 - **b) Build it with `createElement` and set `img.src`**

The real problem is `innerHTML`: it **parses the string as HTML**, so data turns into
markup. A cover value like `x" onerror="alert(1)` closes the `src` attribute and adds
an event handler: `<img src="x" onerror="alert(1)" alt="">`. The image fails to load,
so the attacker's code runs.

`img.src = book.cover` sets the property directly. The value is just a string and is
never parsed as HTML, so it can't add attributes or elements.

- a) Swapping the quotes doesn't help. The attacker just uses `'` instead
  (`x' onerror='alert(1)`).
- c) HTTPS protects data in transit. The malicious value is already in your own data.
- d) `required` only checks the field isn't empty, and it runs in the attacker's own
  browser, where they can remove it.

**Checked in the browser:** innerHTML with double quotes ran the alert. Single quotes
(option a) also ran it. `createElement` + `img.src` (option b) ran nothing.

(For links, also check the URL scheme. `a.href = "javascript:..."` still runs code
when clicked. `img.src` never runs `javascript:` URLs.)

### A28 - **c) `https://app.example.com:443/login`**

**Origin = scheme + host + port.** The path doesn't matter.
`https://app.example.com/books` uses port **443**, the default for https.

- a) `http` is a different scheme (and port 80).
- b) `api.example.com` is a different host. Subdomains are different origins.
- c) Same scheme, same host, and `:443` is just the default port written out.
  **Same origin.** The different path doesn't matter.
- d) Port 8443 is a different port.

**Checked:** `new URL(u).origin` gives `https://app.example.com` only for c.

### A29 - **c) It can't read the cookie, but it can still act as the user**

- `HttpOnly`: JavaScript can't read the cookie (`document.cookie` leaves it out), so
  the attacker **can't steal** it.
- `Secure`: the cookie is only sent over HTTPS.
- `SameSite=Lax`: the cookie isn't sent with requests *from other sites* (except
  plain link clicks). That protects against CSRF.

But an XSS script runs **inside the site itself**, so its requests are same-origin
and the browser attaches the cookie as usual. The attacker can't take the session
away, but can **use** it while the page is open: `fetch("/api/books/7", { method:
"DELETE" })`, read anything on the page, change the page, log keystrokes, and so on.

- b) Blocked by `HttpOnly`.
- a) Cookie flags limit the damage, but they don't prevent XSS. Only output encoding
  (`textContent`, no `innerHTML`) and a Content Security Policy do.
- d) The script can do anything the page's own JavaScript can do.

**Checked in the browser:** after the server set an `HttpOnly; Secure; SameSite=Lax`
cookie, `document.cookie` was `""`, but `fetch("/whoami")` reached the server
carrying `Cookie: session=abc123`.

### A30 - **c) On the server**

Everything in the browser is under the user's control. They can un-hide the button
in DevTools, edit the JavaScript, or skip the page and send `DELETE /api/books/7`
with `fetch` or `curl`. Hiding the button is just good UX. On **every** delete
request, the server must check that the logged-in user (from their session) owns
the book, and answer `403 Forbidden` if not.

- b) Hiding it with CSS is the same thing as a).
- d) `localStorage` lives in the browser and the user can edit it freely.

> Never trust the client. Validate and authorize on the server.
