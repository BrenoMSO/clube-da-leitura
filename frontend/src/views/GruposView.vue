<template>
  <div class="grupos-page">
    <!-- Navbar -->
    <header class="app-header">
      <div class="container header-content">
        <div class="header-logo">
          <span class="logo-icon">📚</span>
          <span class="logo-text">Clube da Leitura</span>
        </div>
        <div class="header-user">
          <span class="user-greeting">Olá, <strong>{{ usuarioNome }}</strong></span>
          <button @click="fazerLogout" class="btn btn-secondary btn-sm">Sair</button>
        </div>
      </div>
    </header>

    <main class="container main-content">
      <!-- Seção Superior: Ações de Grupos -->
      <section class="actions-grid">
        <!-- Card: Criar Novo Grupo -->
        <div class="card action-card">
          <div class="action-header">
            <span class="action-icon">✨</span>
            <div>
              <h3>Criar Novo Grupo</h3>
              <p>Inicie uma nova competição de leitura com seus amigos</p>
            </div>
          </div>

          <form @submit.prevent="criarGrupo" class="action-form">
            <div class="form-group">
              <label for="nomeGrupo">Nome do Grupo</label>
              <input
                id="nomeGrupo"
                v-model="novoGrupo.nome"
                type="text"
                placeholder="Ex: Maratonistas de Ficção"
                required
              />
            </div>

            <div class="form-group">
              <label for="descGrupo">Descrição (Opcional)</label>
              <input
                id="descGrupo"
                v-model="novoGrupo.descricao"
                type="text"
                placeholder="Ex: Lendo 1 livro clássico por mês"
              />
            </div>

            <button type="submit" class="btn btn-primary" :disabled="salvandoGrupo">
              {{ salvandoGrupo ? 'Criando...' : 'Criar Grupo' }}
            </button>
          </form>
        </div>

        <!-- Card: Entrar com Código -->
        <div class="card action-card">
          <div class="action-header">
            <span class="action-icon">🔑</span>
            <div>
              <h3>Entrar num Grupo</h3>
              <p>Use o código de convite de 6 caracteres partilhado com você</p>
            </div>
          </div>

          <form @submit.prevent="entrarComCodigo" class="action-form">
            <div class="form-group">
              <label for="codigoConvite">Código de Convite</label>
              <input
                id="codigoConvite"
                v-model="codigoEntrada"
                type="text"
                placeholder="Ex: LEIT99"
                maxlength="6"
                style="text-transform: uppercase; letter-spacing: 2px; font-weight: 700;"
                required
              />
            </div>

            <button type="submit" class="btn btn-secondary" :disabled="entrandoGrupo">
              {{ entrandoGrupo ? 'Entrando...' : 'Entrar no Grupo' }}
            </button>
          </form>
        </div>
      </section>

      <!-- Mensagens Globais -->
      <div v-if="feedbackMensagem" :class="['alert', feedbackSucesso ? 'alert-success' : 'alert-error']">
        {{ feedbackMensagem }}
      </div>

      <!-- Seção: Lista de Grupos -->
      <section class="groups-section">
        <div class="section-title">
          <h2>Meus Grupos de Leitura</h2>
          <span class="badge badge-primary">{{ grupos.length }} {{ grupos.length === 1 ? 'grupo' : 'grupos' }}</span>
        </div>

        <div v-if="carregandoGrupos" class="loading-state">
          Carregando seus grupos...
        </div>

        <div v-else-if="grupos.length === 0" class="card empty-state">
          <span class="empty-icon">📖</span>
          <h3>Você ainda não está em nenhum grupo</h3>
          <p>Crie um novo grupo acima ou entre em um grupo existente com um código de convite.</p>
        </div>

        <div v-else class="groups-grid">
          <div
            v-for="grupo in grupos"
            :key="grupo._id"
            class="card group-card"
            @click="abrirGrupo(grupo._id)"
          >
            <div class="group-card-header">
              <h3 class="group-title">{{ grupo.nome }}</h3>
              <span class="badge badge-primary">
                {{ grupo.membros?.length || 1 }} {{ (grupo.membros?.length || 1) === 1 ? 'membro' : 'membros' }}
              </span>
            </div>

            <p class="group-desc">
              {{ grupo.descricao || 'Sem descrição cadastrada.' }}
            </p>

            <div class="group-invite-box" @click.stop="copiarCodigo(grupo.codigoConvite)">
              <span class="invite-label">Código de Convite:</span>
              <strong class="invite-code">{{ grupo.codigoConvite }}</strong>
              <button type="button" class="btn-copy" title="Copiar Código">📋</button>
            </div>

            <div class="group-card-footer">
              <button class="btn btn-primary btn-sm btn-block">
                Ver Competição & Ranking ➔
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';

interface Grupo {
  _id: string;
  nome: string;
  descricao?: string;
  codigoConvite: string;
  criadorId: any;
  membros: any[];
  createdAt: string;
}

const router = useRouter();

const grupos = ref<Grupo[]>([]);
const carregandoGrupos = ref(true);
const salvandoGrupo = ref(false);
const entrandoGrupo = ref(false);
const feedbackMensagem = ref('');
const feedbackSucesso = ref(true);

const novoGrupo = reactive({
  nome: '',
  descricao: '',
});

const codigoEntrada = ref('');

const usuarioNome = computed(() => {
  const dadosStr = localStorage.getItem('usuario');
  if (dadosStr) {
    try {
      const u = JSON.parse(dadosStr);
      return u.nome || 'Leitor';
    } catch {
      return 'Leitor';
    }
  }
  return 'Leitor';
});

const carregarGrupos = async () => {
  carregandoGrupos.value = true;
  try {
    const res = await api.get('/grupos');
    grupos.value = res.data;
  } catch (error: any) {
    exibirFeedback(error.response?.data?.mensagem || 'Erro ao carregar grupos.', false);
  } finally {
    carregandoGrupos.value = false;
  }
};

const criarGrupo = async () => {
  salvandoGrupo.value = true;
  try {
    const res = await api.post('/grupos', {
      nome: novoGrupo.nome,
      descricao: novoGrupo.descricao,
    });
    exibirFeedback('Grupo criado com sucesso!', true);
    novoGrupo.nome = '';
    novoGrupo.descricao = '';
    await carregarGrupos();
    // Navegar diretamente para o novo grupo
    if (res.data.grupo?._id) {
      router.push(`/grupos/${res.data.grupo._id}`);
    }
  } catch (error: any) {
    exibirFeedback(error.response?.data?.mensagem || 'Erro ao criar grupo.', false);
  } finally {
    salvandoGrupo.value = false;
  }
};

const entrarComCodigo = async () => {
  entrandoGrupo.value = true;
  try {
    const res = await api.post('/grupos/entrar', {
      codigoConvite: codigoEntrada.value,
    });
    exibirFeedback(res.data.mensagem || 'Você entrou no grupo!', true);
    codigoEntrada.value = '';
    await carregarGrupos();
    if (res.data.grupo?._id) {
      router.push(`/grupos/${res.data.grupo._id}`);
    }
  } catch (error: any) {
    exibirFeedback(error.response?.data?.mensagem || 'Código de convite inválido ou erro ao entrar.', false);
  } finally {
    entrandoGrupo.value = false;
  }
};

const abrirGrupo = (grupoId: string) => {
  router.push(`/grupos/${grupoId}`);
};

const copiarCodigo = async (codigo: string) => {
  try {
    await navigator.clipboard.writeText(codigo);
    exibirFeedback(`Código "${codigo}" copiado para a área de transferência!`, true);
  } catch {
    exibirFeedback(`Código do grupo: ${codigo}`, true);
  }
};

const exibirFeedback = (msg: string, sucesso: boolean) => {
  feedbackMensagem.value = msg;
  feedbackSucesso.value = sucesso;
  setTimeout(() => {
    feedbackMensagem.value = '';
  }, 4000);
};

const fazerLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  router.push('/login');
};

onMounted(() => {
  carregarGrupos();
});
</script>

<style scoped>
.grupos-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 26px;
}

.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-greeting {
  font-size: 14px;
  color: var(--text-muted);
}

.main-content {
  flex: 1;
  padding-top: 32px;
  padding-bottom: 48px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.action-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.action-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.action-icon {
  font-size: 28px;
  background-color: var(--primary-light);
  padding: 8px;
  border-radius: var(--radius-md);
  line-height: 1;
}

.action-header h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
}

.action-header p {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.action-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.form-group input:focus {
  border-color: var(--primary);
}

.groups-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 15px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 48px;
  display: inline-block;
  margin-bottom: 12px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 14px;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.group-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.group-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.group-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.group-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
}

.group-desc {
  font-size: 13px;
  color: var(--text-muted);
  flex: 1;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.group-invite-box {
  background-color: var(--primary-light);
  border: 1px dashed var(--primary);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.invite-label {
  font-size: 12px;
  color: var(--text-muted);
}

.invite-code {
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--primary);
}

.btn-copy {
  background: transparent;
  font-size: 14px;
}

.group-card-footer {
  margin-top: auto;
}

.btn-block {
  width: 100%;
}
</style>
