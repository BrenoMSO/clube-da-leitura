/**
 * Configurações globais e utilitários de autenticação / API
 * Preparado para GitHub Pages e consumo de API remota ou local
 */

// Se estiver no localhost/127.0.0.1, usa o backend local na porta 3000.
// Em produção (GitHub Pages), aponte para a URL do seu backend no Render, Railway ou VPS.
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = IS_LOCAL 
  ? 'http://localhost:3000' 
  : 'https://clube-da-leitura-api.onrender.com'; // Altere aqui para a URL do seu backend em produção

const STORAGE_KEYS = {
  TOKEN: 'clube_leitura_token',
  USER: 'clube_leitura_user'
};

/**
 * Retorna o token JWT salvo
 */
function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * Salva o token JWT e dados do usuário
 */
function setSession(token, user) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

/**
 * Retorna o usuário logado
 */
function getUser() {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Realiza logout e redireciona para a página de login
 */
function logout() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href = 'index.html';
}

/**
 * Verifica se o usuário está autenticado; se não, redireciona para index.html
 */
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/**
 * Se já estiver autenticado e tentar acessar a página inicial/auth, redireciona para dashboard.html
 */
function redirectIfAuthenticated() {
  const token = getToken();
  if (token) {
    window.location.href = 'dashboard.html';
  }
}

/**
 * Wrapper sobre fetch para chamadas autenticadas na API
 */
async function authFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expirado ou inválido
      logout();
      return null;
    }

    return response;
  } catch (error) {
    console.error('Erro na requisição à API:', error);
    throw error;
  }
}

/**
 * Utilitário de feedback visual (Alerta / Toast)
 */
function showNotification(message, type = 'info') {
  let container = document.getElementById('notification-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px;
    font-weight: 500;
    max-width: 320px;
    animation: fadeIn 0.3s ease-out;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  `;

  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
