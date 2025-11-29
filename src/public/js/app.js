async function loadTitles() {
  const res = await fetch("/title-list-json", { cache: "no-store" });
  if (!res.ok) throw new Error(`bad status ${res.status}`);
  const titles = await res.json(); // expects ["Title A","Title B",...]
  renderTitles(titles);
}

function renderTitles(titles) {
  const list = document.getElementById("titles");
  list.innerHTML = "";
  for (const t of titles) {
    const li = document.createElement("li");
    li.textContent = t;
    list.appendChild(li);
  }
}

document.getElementById("refresh").addEventListener("click", () => {
  loadTitles().catch(err => console.error(err));
});

// initial load
loadTitles().catch(err => console.error(err));
