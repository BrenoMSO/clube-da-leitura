/**
 * dashboard.js - Lógica do Dashboard de Grupos
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  const userDisplay = document.getElementById('user-display');
  const welcomeTitle = document.getElementById('welcome-title');
  const btnLogout = document.getElementById('btn-logout');

  if (user && user.nome) {
    userDisplay.innerHTML = `Leitor: <strong>${user.nome}</strong>`;
    welcomeTitle.textContent = `Olá, ${user.nome.split(' ')[0]}!`;
  }

  btnLogout.addEventListener('click', () => {
    logout();
  });

  const formCriarGrupo = document.getElementById('form-criar-grupo');
  const btnCriarGrupo = document.getElementById('btn-criar-grupo');
  const formEntrarGrupo = document.getElementById('form-entrar-grupo');
  const btnEntrarGrupo = document.getElementById('btn-entrar-grupo');

  const loadingGrupos = document.getElementById('loading-grupos');
  const emptyGrupos = document.getElementById('empty-grupos');
  const listaGrupos = document.getElementById('lista-grupos');
  const gruposCount = document.getElementById('grupos-count');

  // Carregar grupos do usuário
  async function carregarGrupos() {
    loadingGrupos.style.display = 'block';
    emptyGrupos.style.display = 'none';
    listaGrupos.style.display = 'none';

    try {
      const response = await authFetch('/api/grupos');
      if (!response) return;

      const grupos = await response.json();

      loadingGrupos.style.display = 'none';

      if (!Array.isArray(grupos) || grupos.length === 0) {
        emptyGrupos.style.display = 'block';
        gruposCount.textContent = '0 grupos';
        return;
      }

      gruposCount.textContent = `${grupos.length} ${grupos.length === 1 ? 'grupo' : 'grupos'}`;
      listaGrupos.innerHTML = '';

      grupos.forEach((grupo) => {
        const totalMembros = grupo.membros ? grupo.membros.length : 1;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <h3 class="card-title" style="margin-bottom: 0;">${escapeHtml(grupo.nome)}</h3>
            <span class="badge">👥 ${totalMembros} ${totalMembros === 1 ? 'membro' : 'membros'}</span>
          </div>
          <p class="card-subtitle" style="min-height: 2.5rem;">
            ${escapeHtml(grupo.descricao || 'Sem descrição cadastrada.')}
          </p>

          <div style="background: #f1f5f9; padding: 0.625rem 0.875rem; border-radius: 8px; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Código de convite:</span>
              <strong style="letter-spacing: 1px; font-size: 0.95rem; color: var(--text-main);">${grupo.codigoConvite}</strong>
            </div>
            <button class="btn btn-outline btn-sm btn-copiar" data-codigo="${grupo.codigoConvite}">
              Copiar
            </button>
          </div>

          <a href="grupo.html?id=${grupo._id}" class="btn btn-primary" style="width: 100%;">
            Abrir Competição 🏆
          </a>
        `;
        listaGrupos.appendChild(card);
      });

      // Adicionar listeners para copiar código
      document.querySelectorAll('.btn-copiar').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const codigo = e.currentTarget.getAttribute('data-codigo');
          navigator.clipboard.writeText(codigo).then(() => {
            showNotification(`Código ${codigo} copiado para a área de transferência!`, 'success');
          }).catch(() => {
            showNotification(`Código: ${codigo}`, 'info');
          });
        });
      });

      listaGrupos.style.display = 'grid';

    } catch (error) {
      loadingGrupos.style.display = 'none';
      showNotification('Erro ao carregar lista de grupos.', 'error');
    }
  }

  // Criar grupo
  formCriarGrupo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('novo-grupo-nome').value.trim();
    const descricao = document.getElementById('novo-grupo-desc').value.trim();

    if (!nome) return;

    btnCriarGrupo.disabled = true;
    btnCriarGrupo.textContent = 'Criando...';

    try {
      const response = await authFetch('/api/grupos', {
        method: 'POST',
        body: JSON.stringify({ nome, descricao })
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao criar grupo.');
      }

      showNotification('Grupo criado com sucesso!', 'success');
      formCriarGrupo.reset();
      await carregarGrupos();

    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      btnCriarGrupo.disabled = false;
      btnCriarGrupo.textContent = 'Criar Grupo';
    }
  });

  // Entrar em grupo via código
  formEntrarGrupo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigoInput = document.getElementById('codigo-convite');
    const codigoConvite = codigoInput.value.trim().toUpperCase();

    if (!codigoConvite || codigoConvite.length !== 6) {
      showNotification('O código deve conter exatamente 6 caracteres.', 'error');
      return;
    }

    btnEntrarGrupo.disabled = true;
    btnEntrarGrupo.textContent = 'Entrando...';

    try {
      const response = await authFetch('/api/grupos/entrar', {
        method: 'POST',
        body: JSON.stringify({ codigoConvite })
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Código de grupo inválido.');
      }

      showNotification('Você ingressou no grupo com sucesso!', 'success');
      formEntrarGrupo.reset();
      await carregarGrupos();

    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      btnEntrarGrupo.disabled = false;
      btnEntrarGrupo.textContent = 'Entrar no Grupo';
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  // Inicialização
  await carregarGrupos();
});
