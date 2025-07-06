import { registerApi } from '../../lib/api';

export function RegisterForm(onSuccess: () => void, onSwitchToLogin: () => void): HTMLElement {
  const div = document.createElement('div');
  div.className = 'w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100';
  
  div.innerHTML = `
    <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
      <h2 class="text-3xl font-bold mb-8 text-center text-gray-800">Create Account</h2>
      <form id="register-form" class="flex flex-col gap-4">
        <input name="username" type="text" placeholder="Username" 
               class="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" required />
        <input name="password" type="password" placeholder="Password" 
               class="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" required />
        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-3 font-semibold transition-colors mt-2">
          Create Account
        </button>
      </form>
      <div id="register-error" class="text-red-500 mt-4 text-sm text-center"></div>
      <div class="mt-6 text-center">
        <span class="text-gray-600">Already have an account? </span>
        <button id="to-login" class="text-blue-500 hover:text-blue-600 font-medium transition-colors">Sign in</button>
      </div>
    </div>
  `;

  // Event listeners
  div.querySelector('#to-login')?.addEventListener('click', onSwitchToLogin);
  
  const form = div.querySelector('#register-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorDiv = div.querySelector('#register-error') as HTMLDivElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    errorDiv.textContent = '';
    submitBtn.textContent = 'Loading...';
    
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      await registerApi(username, password);
      onSuccess();
    } catch (err: any) {
      errorDiv.textContent = err.message || 'Register failed';
    } finally {
      submitBtn.textContent = 'Create Account';
    }
  });
  
  return div;
} 