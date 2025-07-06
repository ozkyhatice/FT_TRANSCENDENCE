export function GameArea(): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-700 mb-4">Pong Game</h2>
      <div class="bg-gray-900 rounded-xl p-8 inline-block shadow-inner">
        <div class="text-white text-lg mb-4">Game will start here</div>
        <div class="flex justify-center gap-4">
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">Start Game</button>
          <button class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Join Game</button>
        </div>
      </div>
    </div>
  `;
  return div;
} 