import './style.css';

const app = document.getElementById('app')!;

export function showHome() {
  app.innerHTML = `
    <h1>❤️ Valentine Challenge ❤️</h1>

    <p>
      To prove yourself, you must beat me in <strong>3 out of 5 games</strong>.
    </p>

    <ul>
      <li>Each game is based on skill and speed</li>
      <li>No trick questions, no inside knowledge</li>
      <li>Your goal is to beat my score</li>
      <li>You can retry games as many times as you want</li>
    </ul>

    <p>Win 3 games and you’ll unlock something special 👀</p>

    <button id="start">Start Challenge</button>
  `;

  document.getElementById('start')!.onclick = () => {
    console.log('Start first game');
  };
}

showHome();
