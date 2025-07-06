export function Tournament(): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="flex flex-col h-full">
      <h3 class="font-bold text-lg text-gray-700 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        Tournament
      </h3>
      <div class="flex-1 space-y-3">
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="font-medium text-gray-700 text-sm">Weekly Championship</div>
          <div class="text-xs text-gray-500 mt-1">16 players • Starting soon</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="font-medium text-gray-700 text-sm">Daily Quick Match</div>
          <div class="text-xs text-gray-500 mt-1">8 players • In progress</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="font-medium text-gray-700 text-sm">Beginner League</div>
          <div class="text-xs text-gray-500 mt-1">32 players • Open</div>
        </div>
      </div>
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-4">
        Join Tournament
      </button>
    </div>
  `;
  return div;
} 