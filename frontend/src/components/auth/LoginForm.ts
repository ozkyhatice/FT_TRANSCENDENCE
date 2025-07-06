import { loginApi, setToken } from '../../lib/api';

export function LoginForm(onSuccess: () => void, onSwitchToRegister: () => void): HTMLElement {
  const div = document.createElement('div');
  div.className = 'w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100';
  
  div.innerHTML = `
    <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
      <h2 class="text-3xl font-bold mb-8 text-center text-gray-800">Welcome Back</h2>
      <form id="login-form" class="flex flex-col gap-4">
        <input name="username" type="text" placeholder="Username" 
               class="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
        <input name="password" type="password" placeholder="Password" 
               class="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold transition-colors mt-2">
          Login
        </button>
      </form>
      <div id="login-error" class="text-red-500 mt-4 text-sm text-center"></div>
      <div class="mt-6 text-center">
        <span class="text-gray-600">Don't have an account? </span>
        <button id="to-register" class="text-blue-500 hover:text-blue-600 font-medium transition-colors">Sign up</button>
      </div>
    </div>
  `;

  // Event listeners
  div.querySelector('#to-register')?.addEventListener('click', onSwitchToRegister);
  
  const form = div.querySelector('#login-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorDiv = div.querySelector('#login-error') as HTMLDivElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    errorDiv.textContent = '';
    submitBtn.textContent = 'Loading...';
    
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      const res = await loginApi(username, password);
      setToken(res.token);
      onSuccess();
    } catch (err: any) {
      errorDiv.textContent = err.message || 'Login failed';
    } finally {
      submitBtn.textContent = 'Login';
    }
  });
  return div;
} 