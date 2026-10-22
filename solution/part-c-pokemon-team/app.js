// Pokémon Team - write your JavaScript in this file.
// index.html already loads it with <script type="module" src="app.js">.

const form = document.querySelector("#add-form");
const filter = document.querySelector("#filter");
const summary = document.querySelector("#summary");
const message = document.querySelector("#message");
const list = document.querySelector("#team-list");

let team = [];

// 3. One card: <li class="card"> with an <h3>, a badge, a <p> and a Train button.
// Only textContent is used, so a name like <b>Pikachu</b> shows up as plain text.
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

function render() {
  // 6. The Show menu decides which cards are drawn...
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

// 2. Load the team. If the request fails or the answer isn't OK, show a message;
// the team stays empty and the rest of the page keeps working.
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

// 4. Add a Pokémon without reloading the page.
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

// 5. One listener for every Train button (event delegation).
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

filter.addEventListener("change", render);

loadTeam();
