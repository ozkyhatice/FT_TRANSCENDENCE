export function GeneralChat(): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="flex flex-col h-full">
      <h3 class="font-bold text-lg text-gray-700 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd"/>
        </svg>
        General Chat
      </h3>
      <div class="flex-1 bg-gray-50 rounded-lg p-3 overflow-y-auto border border-gray-200 space-y-2">
        <div class="text-xs text-gray-500 text-center mb-2">--- Today ---</div>
        <div class="bg-white rounded-lg p-2 shadow-sm">
          <div class="font-medium text-gray-700 text-sm">Player1</div>
          <div class="text-gray-600 text-sm">Looking for a quick match!</div>
          <div class="text-xs text-gray-400 mt-1">2 min ago</div>
        </div>
        <div class="bg-white rounded-lg p-2 shadow-sm">
          <div class="font-medium text-gray-700 text-sm">Player2</div>
          <div class="text-gray-600 text-sm">GG everyone! Great tournament</div>
          <div class="text-xs text-gray-400 mt-1">5 min ago</div>
        </div>
      </div>
      <div class="mt-3 flex gap-2">
        <input type="text" placeholder="Type a message..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Send
        </button>
      </div>
    </div>
  `;
  return div;
} 