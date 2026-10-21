/**
 * auth.js - Lógica de Login e Registo para o Clube da Leitura
 */

document.addEventListener('DOMContentLoaded', () => {
  // Se o utilizador já possui token válido, redireciona diretamente para o dashboard
  redirectIfAuthenticated();

  // Elementos do DOM
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const alertBox = document.getElementById('alert-box');

  const btnSubmitLogin = document.getElementById('btn-submit-login');
  const btnSubmitRegister = document.getElementById('btn-submit-register');

  // Alternar abas
  function switchTab(tab) {
    clearAlert();
    if (tab === 'login') {
      tabLoginBtn.classList.add('active');
      tabRegisterBtn.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
    } else {
      tabRegisterBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      formRegister.style.display = 'block';
      formLogin.style.display = 'none';
    }
  }

  tabLoginBtn.addEventListener('click', () => switchTab('login'));
  tabRegisterBtn.addEventListener('click', () => switchTab('register'));

  // Exibir alertas
  function showAlert(message, type = 'danger') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
  }

  function clearAlert() {
    alertBox.textContent = '';
    alertBox.style.display = 'none';
  }

  // Submeter Login
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
      showAlert('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setButtonLoading(btnSubmitLogin, true, 'A autenticar...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Falha ao realizar login.');
      }

      // Salva token e dados do usuário no localStorage
      setSession(data.token, data.usuario);
      showAlert('Login efetuado com sucesso! Redirecionando...', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);

    } catch (error) {
      showAlert(error.message || 'Erro ao conectar com o servidor.');
    } finally {
      setButtonLoading(btnSubmitLogin, false, 'Entrar na Minha Conta');
    }
  });

  // Submeter Registo
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const nome = document.getElementById('register-nome').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const senha = document.getElementById('register-senha').value;
    const confirmarSenha = document.getElementById('register-confirmar-senha').value;

    if (!nome || !email || !senha) {
      showAlert('Por favor, preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      showAlert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      showAlert('As senhas não coincidem. Verifique a confirmação.');
      return;
    }

    setButtonLoading(btnSubmitRegister, true, 'A criar conta...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Falha ao registrar utilizador.');
      }

      showAlert('Conta criada com sucesso! A iniciar sessão...', 'success');

      // Tenta login automático com as credenciais cadastradas
      try {
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });
        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.token) {
          setSession(loginData.token, loginData.usuario);
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
          return;
        }
      } catch (loginErr) {
        // Se falhar o auto-login, apenas direciona para a aba de login
        console.warn('Auto-login pós-registo falhou:', loginErr);
      }

      // Fallback: muda para a aba de login
      setTimeout(() => {
        switchTab('login');
        document.getElementById('login-email').value = email;
        showAlert('Conta criada! Introduza a sua senha para entrar.', 'success');
      }, 1000);

    } catch (error) {
      showAlert(error.message || 'Erro ao conectar com o servidor.');
    } finally {
      setButtonLoading(btnSubmitRegister, false, 'Criar Minha Conta');
    }
  });

  // Utilitário de estado do botão
  function setButtonLoading(button, isLoading, text) {
    button.disabled = isLoading;
    button.textContent = text;
  }
});
