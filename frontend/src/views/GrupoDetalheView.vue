<template>
  <div class="detalhe-page">
    <!-- Navbar -->
    <header class="app-header">
      <div class="container header-content">
        <div class="header-nav">
          <router-link to="/grupos" class="btn btn-secondary btn-sm">
            ← Meus Grupos
          </router-link>
          <div class="group-brand">
            <span class="group-icon">🏆</span>
            <h1 class="group-title">{{ grupo?.nome || 'Carregando Grupo...' }}</h1>
          </div>
        </div>
        <div class="header-actions">
          <div v-if="grupo" class="invite-pill" @click="copiarCodigoConvite">
            <span>Convite:</span>
            <strong>{{ grupo.codigoConvite }}</strong>
            <button class="btn-copy" title="Copiar Código">📋</button>
          </div>
          <button @click="fazerLogout" class="btn btn-secondary btn-sm">Sair</button>
        </div>
      </div>
    </header>

    <main class="container main-content">
      <!-- Feedback de Notificação -->
      <div v-if="feedbackMensagem" :class="['alert', feedbackSucesso ? 'alert-success' : 'alert-error']">
        {{ feedbackMensagem }}
      </div>

      <div v-if="carregando" class="loading-state">
        Carregando competição e ranking...
      </div>

      <div v-else-if="grupo" class="dashboard-grid">
        <!-- COLUNA 1: RANKING DA COMPETIÇÃO -->
        <section class="card ranking-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-badge">🏁 Classificação</span>
              <h2>Ranking do Grupo</h2>
              <p class="section-desc">1 página lida = 1 ponto na competição</p>
            </div>
            <button @click="carregarDetalhes" class="btn btn-secondary btn-sm" title="Atualizar Ranking">
              🔄 Atualizar
            </button>
          </div>

          <div v-if="ranking.length === 0" class="empty-mini">
            Nenhum membro pontuou ainda. Comece a ler para liderar o ranking!
          </div>

          <div v-else class="ranking-list">
            <div
              v-for="item in ranking"
              :key="item.usuarioId"
              class="ranking-item"
              :class="{ 'is-me': item.usuarioId === meuUsuarioId, 'top-1': item.posicao === 1 }"
            >
              <div class="rank-badge">
                <span v-if="item.posicao === 1">🥇</span>
                <span v-else-if="item.posicao === 2">🥈</span>
                <span v-else-if="item.posicao === 3">🥉</span>
                <span v-else class="rank-number">#{{ item.posicao }}</span>
              </div>

              <div class="rank-info">
                <div class="rank-name-row">
                  <strong class="rank-name">{{ item.nome }}</strong>
                  <span v-if="item.usuarioId === meuUsuarioId" class="badge badge-primary">Você</span>
                </div>
                <span class="rank-books">{{ item.totalLivros }} {{ item.totalLivros === 1 ? 'livro registrado' : 'livros registrados' }}</span>
              </div>

              <div class="rank-score">
                <strong class="score-points">{{ item.pontos }}</strong>
                <span class="score-label">pontos</span>
              </div>
            </div>
          </div>
        </section>

        <!-- COLUNA 2: MEUS LIVROS & REGISTRO DE LEITURA -->
        <section class="card books-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-badge">📖 Meus Livros</span>
              <h2>Meu Progresso no Grupo</h2>
              <p class="section-desc">Atualize suas páginas lidas para somar pontos</p>
            </div>
            <button @click="abrirModalBusca" class="btn btn-primary btn-sm">
              + Adicionar Livro
            </button>
          </div>

          <div v-if="minhasLeituras.length === 0" class="empty-books">
            <span class="empty-books-icon">📚</span>
            <h3>Nenhum livro adicionado ainda</h3>
            <p>Busque um livro no Google Books e adicione-o à sua competição.</p>
            <button @click="abrirModalBusca" class="btn btn-primary btn-sm" style="margin-top: 12px;">
              Buscar Livro no Google Books
            </button>
          </div>

          <div v-else class="my-books-list">
            <div v-for="livro in minhasLeituras" :key="livro._id" class="book-item">
              <div class="book-cover-wrap">
                <img
                  v-if="livro.capaUrl"
                  :src="livro.capaUrl"
                  :alt="livro.tituloLivro"
                  class="book-cover"
                />
                <div v-else class="book-cover-placeholder">📖</div>
              </div>

              <div class="book-details">
                <div class="book-title-row">
                  <h4 class="book-title">{{ livro.tituloLivro }}</h4>
                  <span v-if="livro.concluido" class="badge badge-success">✓ Concluído</span>
                </div>
                <p class="book-author">{{ livro.autor }}</p>

                <!-- Barra de Progresso -->
                <div class="progress-container">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: calcularPorcentagem(livro) + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">
                    {{ livro.paginasLidas }} / {{ livro.totalPaginas }} páginas ({{ calcularPorcentagem(livro) }}%)
                  </span>
                </div>

                <!-- Formulário de Atualizar Progresso -->
                <div class="progress-update-row">
                  <div class="input-pages-wrap">
                    <label>Páginas lidas:</label>
                    <input
                      type="number"
                      min="0"
                      :max="livro.totalPaginas"
                      v-model.number="progressoLocal[livro._id]"
                      class="input-pages"
                    />
                  </div>
                  <button
                    @click="salvarProgresso(livro)"
                    class="btn btn-secondary btn-sm"
                    :disabled="atualizandoLeituraId === livro._id"
                  >
                    {{ atualizandoLeituraId === livro._id ? 'Salvando...' : 'Salvar Progresso' }}
                  </button>
                </div>

                <!-- Seção de Avaliação (1 a 5 estrelas) se Concluído -->
                <div v-if="livro.concluido" class="rating-section">
                  <span class="rating-label">Sua Avaliação:</span>
                  <div class="stars-selector">
                    <button
                      v-for="estrela in 5"
                      :key="estrela"
                      type="button"
                      class="star-btn"
                      :class="{ 'star-active': (livro.avaliacao || 0) >= estrela }"
                      @click="avaliarLivro(livro, estrela)"
                      :title="`${estrela} estrela${estrela > 1 ? 's' : ''}`"
                    >
                      ⭐
                    </button>
                  </div>
                  <span v-if="livro.avaliacao" class="rating-score">
                    ({{ livro.avaliacao }}/5)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- MODAL DE BUSCA NO GOOGLE BOOKS -->
    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModalBusca">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Buscar Livro no Google Books</h3>
          <button @click="fecharModalBusca" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="pesquisarLivros" class="search-form">
            <input
              v-model="termoBusca"
              type="text"
              placeholder="Digite o título do livro ou autor..."
              class="search-input"
              autofocus
            />
            <button type="submit" class="btn btn-primary" :disabled="buscandoLivros">
              {{ buscandoLivros ? 'Buscando...' : 'Buscar' }}
            </button>
          </form>

          <div v-if="buscandoLivros" class="search-loading">
            Consultando o Google Books...
          </div>

          <div v-else-if="buscaRealizada && resultadosBusca.length === 0" class="search-empty">
            Nenhum livro encontrado para "{{ termoBusca }}". Tente outro termo.
          </div>

          <div v-else class="search-results">
            <div
              v-for="item in resultadosBusca"
              :key="item.googleBookId"
              class="search-item"
            >
              <img
                v-if="item.capaUrl"
                :src="item.capaUrl"
                :alt="item.tituloLivro"
                class="search-thumb"
              />
              <div v-else class="search-thumb-placeholder">📖</div>

              <div class="search-info">
                <strong class="search-title">{{ item.tituloLivro }}</strong>
                <span class="search-author">{{ item.autor }}</span>

                <!-- Total de páginas ou input manual caso 0 -->
                <div v-if="item.totalPaginas > 0" class="search-pages">
                  📄 {{ item.totalPaginas }} páginas
                </div>
                <div v-else class="search-pages-manual">
                  <span class="manual-warning">⚠️ Páginas não informadas pelo Google Books:</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qtd de páginas"
                    v-model.number="item.totalPaginasManual"
                    class="input-manual-pages"
                  />
                </div>
              </div>

              <button
                @click="selecionarEAdicionar(item)"
                class="btn btn-primary btn-sm btn-add"
                :disabled="adicionandoLivroId === item.googleBookId"
              >
                {{ adicionandoLivroId === item.googleBookId ? 'Adicionando...' : '+ Adicionar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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

interface RankingItem {
  posicao: number;
  usuarioId: string;
  nome: string;
  email: string;
  pontos: number;
  totalLivros: number;
}

interface Leitura {
  _id: string;
  usuarioId: any;
  grupoId: string;
  googleBookId?: string;
  tituloLivro: string;
  autor: string;
  capaUrl?: string;
  totalPaginas: number;
  paginasLidas: number;
  concluido: boolean;
  avaliacao?: number;
}

interface LivroBusca {
  googleBookId: string;
  tituloLivro: string;
  autor: string;
  capaUrl: string;
  totalPaginas: number;
  totalPaginasManual?: number;
}

const route = useRoute();
const router = useRouter();
const grupoId = route.params.grupoId as string;

const grupo = ref<Grupo | null>(null);
const ranking = ref<RankingItem[]>([]);
const minhasLeituras = ref<Leitura[]>([]);
const carregando = ref(true);

const feedbackMensagem = ref('');
const feedbackSucesso = ref(true);

// Estado de atualização de leitura
const progressoLocal = reactive<Record<string, number>>({});
const atualizandoLeituraId = ref<string | null>(null);

// Estado do modal de busca
const modalAberto = ref(false);
const termoBusca = ref('');
const buscandoLivros = ref(false);
const buscaRealizada = ref(false);
const resultadosBusca = ref<LivroBusca[]>([]);
const adicionandoLivroId = ref<string | null>(null);

const meuUsuarioId = computed(() => {
  const dadosStr = localStorage.getItem('usuario');
  if (dadosStr) {
    try {
      const u = JSON.parse(dadosStr);
      return u.id;
    } catch {
      return '';
    }
  }
  return '';
});

const carregarDetalhes = async () => {
  try {
    const res = await api.get(`/grupos/${grupoId}/detalhes`);
    grupo.value = res.data.grupo;
    ranking.value = res.data.ranking;
    minhasLeituras.value = res.data.minhasLeituras;

    // Inicializar progresso local para edição rápida
    minhasLeituras.value.forEach((l) => {
      progressoLocal[l._id] = l.paginasLidas;
    });
  } catch (error: any) {
    exibirFeedback(
      error.response?.data?.mensagem || 'Erro ao carregar detalhes da competição.',
      false
    );
  } finally {
    carregando.value = false;
  }
};

const calcularPorcentagem = (livro: Leitura): number => {
  if (!livro.totalPaginas || livro.totalPaginas <= 0) return 0;
  const pct = Math.round((livro.paginasLidas / livro.totalPaginas) * 100);
  return Math.min(100, Math.max(0, pct));
};

const salvarProgresso = async (livro: Leitura) => {
  const novaQtd = progressoLocal[livro._id];

  if (novaQtd === undefined || isNaN(novaQtd) || novaQtd < 0) {
    exibirFeedback('Informe um número válido de páginas lidas.', false);
    return;
  }

  if (novaQtd > livro.totalPaginas) {
    exibirFeedback(`As páginas lidas não podem ultrapassar ${livro.totalPaginas}.`, false);
    return;
  }

  atualizandoLeituraId.value = livro._id;
  try {
    await api.patch(`/leituras/${livro._id}/progresso`, {
      paginasLidas: novaQtd,
    });
    exibirFeedback('Progresso salvo e ranking atualizado!', true);
    await carregarDetalhes();
  } catch (error: any) {
    exibirFeedback(error.response?.data?.mensagem || 'Erro ao salvar progresso.', false);
  } finally {
    atualizandoLeituraId.value = null;
  }
};

const avaliarLivro = async (livro: Leitura, nota: number) => {
  try {
    await api.patch(`/leituras/${livro._id}/avaliar`, {
      avaliacao: nota,
    });
    livro.avaliacao = nota;
    exibirFeedback(`Avaliação de ${nota} estrela(s) salva!`, true);
  } catch (error: any) {
    exibirFeedback(error.response?.data?.mensagem || 'Erro ao avaliar livro.', false);
  }
};

// Modal de Busca Google Books
const abrirModalBusca = () => {
  modalAberto.value = true;
  termoBusca.value = '';
  resultadosBusca.value = [];
  buscaRealizada.value = false;
};

const fecharModalBusca = () => {
  modalAberto.value = false;
};

const pesquisarLivros = async () => {
  if (!termoBusca.value.trim()) return;

  buscandoLivros.value = true;
  buscaRealizada.value = true;
  try {
    const res = await api.get(`/livros/buscar?q=${encodeURIComponent(termoBusca.value.trim())}`);
    resultadosBusca.value = res.data.map((l: LivroBusca) => ({
      ...l,
      totalPaginasManual: l.totalPaginas > 0 ? l.totalPaginas : undefined,
    }));
  } catch (error: any) {
    exibirFeedback(error.response?.data?.mensagem || 'Erro ao buscar livros.', false);
  } finally {
    buscandoLivros.value = false;
  }
};

const selecionarEAdicionar = async (item: LivroBusca) => {
  const total = item.totalPaginas > 0 ? item.totalPaginas : item.totalPaginasManual;

  if (!total || total <= 0) {
    exibirFeedback('Por favor, informe a quantidade de páginas do livro.', false);
    return;
  }

  adicionandoLivroId.value = item.googleBookId;
  try {
    await api.post(`/grupos/${grupoId}/leituras`, {
      googleBookId: item.googleBookId,
      tituloLivro: item.tituloLivro,
      autor: item.autor,
      capaUrl: item.capaUrl,
      totalPaginas: total,
    });

    exibirFeedback(`Livro "${item.tituloLivro}" adicionado ao seu grupo!`, true);
    fecharModalBusca();
    await carregarDetalhes();
  } catch (error: any) {
    exibirFeedback(error.response?.data?.mensagem || 'Erro ao adicionar livro.', false);
  } finally {
    adicionandoLivroId.value = null;
  }
};

const copiarCodigoConvite = async () => {
  if (!grupo.value?.codigoConvite) return;
  try {
    await navigator.clipboard.writeText(grupo.value.codigoConvite);
    exibirFeedback(`Código "${grupo.value.codigoConvite}" copiado!`, true);
  } catch {
    exibirFeedback(`Código: ${grupo.value.codigoConvite}`, true);
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
  carregarDetalhes();
});
</script>

<style scoped>
.detalhe-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  padding: 14px 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.group-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-icon {
  font-size: 24px;
}

.group-title {
  font-size: 19px;
  font-weight: 800;
  color: var(--text-main);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.invite-pill {
  background-color: var(--primary-light);
  border: 1px dashed var(--primary);
  border-radius: var(--radius-md);
  padding: 6px 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.invite-pill strong {
  color: var(--primary);
  letter-spacing: 1px;
}

.btn-copy {
  background: transparent;
  font-size: 13px;
}

.main-content {
  flex: 1;
  padding-top: 28px;
  padding-bottom: 48px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary);
  letter-spacing: 0.5px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 2px;
}

.section-desc {
  font-size: 12px;
  color: var(--text-muted);
}

/* RANKING */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background-color: #f9fafb;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.ranking-item.top-1 {
  background-color: #fffbeb;
  border-color: #fde68a;
}

.ranking-item.is-me {
  border-color: var(--primary);
  background-color: var(--primary-light);
}

.rank-badge {
  font-size: 22px;
  width: 32px;
  text-align: center;
  font-weight: 800;
}

.rank-number {
  font-size: 14px;
  color: var(--text-muted);
}

.rank-info {
  flex: 1;
}

.rank-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-name {
  font-size: 15px;
  color: var(--text-main);
}

.rank-books {
  font-size: 12px;
  color: var(--text-muted);
}

.rank-score {
  text-align: right;
}

.score-points {
  font-size: 18px;
  color: var(--primary);
  font-weight: 800;
  display: block;
}

.score-label {
  font-size: 11px;
  color: var(--text-muted);
}

/* MEUS LIVROS */
.empty-books {
  text-align: center;
  padding: 40px 16px;
}

.empty-books-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.empty-books h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.empty-books p {
  font-size: 13px;
  color: var(--text-muted);
}

.my-books-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.book-cover-wrap {
  width: 72px;
  flex-shrink: 0;
}

.book-cover {
  width: 100%;
  height: 105px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.book-cover-placeholder {
  width: 100%;
  height: 105px;
  background-color: #f3f4f6;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.book-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
}

.book-author {
  font-size: 13px;
  color: var(--text-muted);
}

/* Progresso */
.progress-container {
  margin-top: 4px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, #818cf8 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.progress-update-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.input-pages-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-pages-wrap label {
  font-size: 12px;
  color: var(--text-muted);
}

.input-pages {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

/* Estrelas */
.rating-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);
}

.rating-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
}

.stars-selector {
  display: flex;
  gap: 2px;
}

.star-btn {
  background: transparent;
  font-size: 16px;
  opacity: 0.35;
  transition: transform 0.1s ease, opacity 0.1s ease;
  line-height: 1;
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-btn.star-active {
  opacity: 1;
}

.rating-score {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
}

/* MODAL DE BUSCA */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-dialog {
  background-color: #ffffff;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 700;
}

.btn-close {
  background: transparent;
  font-size: 18px;
  color: var(--text-muted);
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.search-loading,
.search-empty {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: #f9fafb;
}

.search-thumb {
  width: 48px;
  height: 70px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.search-thumb-placeholder {
  width: 48px;
  height: 70px;
  background-color: #e5e7eb;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.search-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.search-title {
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.2;
}

.search-author {
  font-size: 12px;
  color: var(--text-muted);
}

.search-pages {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.search-pages-manual {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.manual-warning {
  font-size: 11px;
  color: #b45309;
}

.input-manual-pages {
  width: 140px;
  padding: 4px 8px;
  border: 1px solid #f59e0b;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.btn-add {
  flex-shrink: 0;
}
</style>
