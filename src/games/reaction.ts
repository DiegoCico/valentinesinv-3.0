const YOUR_REACTION_MS = 280;

let startTime = 0;
let waiting = true;

export function startReactionGame(onWin: () => void, onLose: () => void) {
  const app = document.getElementById('app')!;
  app.innerHTML = `<h2>Wait for green…</h2>`;

  const delay = 1000 + Math.random() * 2000;

  setTimeout(() => {
    waiting = false;
    startTime = performance.now();
    app.innerHTML = `<h2 style="color:green">CLICK!</h2>`;
  }, delay);

  app.onclick = () => {
    if (waiting) return;

    const reaction = performance.now() - startTime;

    if (reaction <= YOUR_REACTION_MS) {
      onWin();
    } else {
      onLose();
    }
  };
}
