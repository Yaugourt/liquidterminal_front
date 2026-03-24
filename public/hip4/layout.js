/** Responsive grid (overview → access control). */
function fixAccessGrid() {
  const g = document.querySelector(".access-grid");
  if (!g) return;
  g.style.gridTemplateColumns = window.innerWidth < 600 ? "1fr" : "1fr 1fr";
}

window.addEventListener("resize", fixAccessGrid);
fixAccessGrid();
