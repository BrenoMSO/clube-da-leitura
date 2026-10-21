<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-brand">
        <span class="auth-icon">📚</span>
        <h1>Clube da Leitura</h1>
        <p class="auth-subtitle">Gamifique seu hábito de leitura entre amigos</p>
      </div>

      <div class="card auth-card">
        <!-- Alternador entre Login e Cadastro -->
        <div class="tab-switcher">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: isLogin }"
            @click="mudarModo(true)"
          >
            Entrar
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: !isLogin }"
            @click="mudarModo(false)"
          >
            Criar Conta
          </button>
        </div>

        <!-- Mensagens de Alerta -->
        <div v-if="mensagemErro" class="alert alert-error">
          {{ mensagemErro }}
        </div>
        <div v-if="mensagemSucesso" class="alert alert-success">
          {{ mensagemSucesso }}
        </div>

        <!-- Formulário -->
        <form @submit.prevent="submeterFormulario" class="auth-form">
          <div v-if="!isLogin" class="form-group">
            <label for="nome">Nome Completo</label>
            <input
              id="nome"
              v-model="formulario.nome"
              type="text"
              placeholder="Ex: Ana Clara"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              id="email"
              v-model="formulario.email"
              type="email"
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="senha">Senha</label>
            <input
              id="senha"
              v-model="formulario.senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              minlength="6"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="carregando">
            <span v-if="carregando">Processando...</span>
            <span v-else>{{ isLogin ? 'Entrar na Plataforma' : 'Criar Minha Conta' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';

const router = useRouter();

const isLogin = ref(true);
const carregando = ref(false);
const mensagemErro = ref('');
const mensagemSucesso = ref('');

const formulario = reactive({
  nome: '',
  email: '',
  senha: '',
});

const mudarModo = (modoLogin: boolean) => {
  isLogin.value = modoLogin;
  mensagemErro.value = '';
  mensagemSucesso.value = '';
};

const submeterFormulario = async () => {
  mensagemErro.value = '';
  mensagemSucesso.value = '';
  carregando.value = true;

  try {
    if (isLogin.value) {
      // Login
      const response = await api.post('/auth/login', {
        email: formulario.email,
        senha: formulario.senha,
      });

      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      router.push('/grupos');
    } else {
      // Registro
      await api.post('/auth/registrar', {
        nome: formulario.nome,
        email: formulario.email,
        senha: formulario.senha,
      });

      mensagemSucesso.value = 'Conta criada com sucesso! Faça login para continuar.';
      isLogin.value = true;
      formulario.senha = '';
    }
  } catch (error: any) {
    mensagemErro.value =
      error.response?.data?.mensagem || 'Ocorreu um erro ao processar sua solicitação.';
  } finally {
    carregando.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #eef2ff 0%, #f9fafb 100%);
}

.auth-container {
  width: 100%;
  max-width: 440px;
}

.auth-brand {
  text-align: center;
  margin-bottom: 24px;
}

.auth-icon {
  font-size: 48px;
  display: inline-block;
  margin-bottom: 8px;
}

.auth-brand h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.auth-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.auth-card {
  box-shadow: var(--shadow-lg);
}

.tab-switcher {
  display: flex;
  background-color: #f3f4f6;
  border-radius: var(--radius-md);
  padding: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.tab-btn.active {
  background-color: #ffffff;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.form-group input {
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.btn-block {
  width: 100%;
  margin-top: 8px;
}
</style>
