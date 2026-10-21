/**
 * grupo.js - Lógica da Página de Grupo / Competição de Leitura
 * Implementa a regra do Debounce de 500ms na busca da API do Google Books para evitar erro 429
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const urlParams = new URLSearchParams(window.location.search);
  const grupoId = urlParams.get('id');

  if (!grupoId) {
    showNotification('Grupo não especificado.', 'error');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
    return;
  }

  const user = getUser();
  const userDisplay = document.getElementById('user-display');
  const btnLogout = document.getElementById('btn-logout');
  if (user && user.nome) {
    userDisplay.innerHTML = `Leitor: <strong>${user.nome}</strong>`;
  }
  btnLogout.addEventListener('click', () => logout());

  // Elementos do Cabeçalho
  const grupoNomeEl = document.getElementById('grupo-nome');
  const grupoDescEl = document.getElementById('grupo-desc');
  const grupoCodigoEl = document.getElementById('grupo-codigo');
  const btnCopiarCodigo = document.getElementById('btn-copiar-codigo');

  // Elementos do Ranking
  const loadingRanking = document.getElementById('loading-ranking');
  const tabelaRanking = document.getElementById('tabela-ranking');
  const rankingBody = document.getElementById('ranking-body');

  // Elementos da Busca de Livros (Debounce)
  const inputBuscaLivro = document.getElementById('input-busca-livro');
  const buscaSpinner = document.getElementById('busca-spinner');
  const resultadosBusca = document.getElementById('resultados-busca');

  // Elementos de Minhas Leituras
  const loadingLeituras = document.getElementById('loading-leituras');
  const emptyLeituras = document.getElementById('empty-leituras');
  const listaLeituras = document.getElementById('lista-leituras');

  let codigoAtual = '';

  btnCopiarCodigo.addEventListener('click', () => {
    if (!codigoAtual) return;
    navigator.clipboard.writeText(codigoAtual).then(() => {
      showNotification(`Código ${codigoAtual} copiado!`, 'success');
    }).catch(() => {
      showNotification(`Código: ${codigoAtual}`, 'info');
    });
  });

  // Função utilitária de Debounce de 500ms
  function debounce(callback, delay = 500) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }

  // ==========================================
  // CARREGAR DADOS DO GRUPO (RANKING E LEITURAS)
  // ==========================================
  async function carregarDetalhesGrupo() {
    loadingRanking.style.display = 'block';
    tabelaRanking.style.display = 'none';
    loadingLeituras.style.display = 'block';
    emptyLeituras.style.display = 'none';
    listaLeituras.innerHTML = '';

    try {
      const response = await authFetch(`/api/grupos/${grupoId}/detalhes`);
      if (!response) return;

      if (!response.ok) {
        throw new Error('Falha ao carregar informações do grupo.');
      }

      const data = await response.json();
      const { grupo, ranking, minhasLeituras } = data;

      // Atualiza Cabeçalho
      codigoAtual = grupo.codigoConvite;
      grupoNomeEl.textContent = grupo.nome;
      grupoDescEl.textContent = grupo.descricao || 'Sem descrição cadastrada.';
      grupoCodigoEl.textContent = grupo.codigoConvite;

      // Renderiza Ranking
      loadingRanking.style.display = 'none';
      rankingBody.innerHTML = '';

      if (ranking && ranking.length > 0) {
        ranking.forEach((item) => {
          const isCurrentUser = user && item.usuarioId === user.id;
          const tr = document.createElement('tr');
          if (isCurrentUser) tr.classList.add('ranking-row-current');

          let medalha = '';
          if (item.posicao === 1) medalha = '🥇 ';
          else if (item.posicao === 2) medalha = '🥈 ';
          else if (item.posicao === 3) medalha = '🥉 ';

          tr.innerHTML = `
            <td class="ranking-pos">${medalha}${item.posicao}º</td>
            <td>
              <div><strong>${escapeHtml(item.nome)}</strong> ${isCurrentUser ? '<span class="badge">Você</span>' : ''}</div>
              <small style="color: var(--text-muted);">${item.totalLivros} ${item.totalLivros === 1 ? 'livro lido' : 'livros lidos'}</small>
            </td>
            <td style="text-align: right; font-weight: 600;">${item.pontos} pág.</td>
            <td style="text-align: right; font-weight: 700; color: var(--primary);">${item.pontos} pts</td>
          `;
          rankingBody.appendChild(tr);
        });
        tabelaRanking.style.display = 'table';
      }

      // Renderiza Minhas Leituras
      loadingLeituras.style.display = 'none';
      if (!minhasLeituras || minhasLeituras.length === 0) {
        emptyLeituras.style.display = 'block';
      } else {
        emptyLeituras.style.display = 'none';
        minhasLeituras.forEach((leitura) => {
          const pct = Math.round((leitura.paginasLidas / leitura.totalPaginas) * 100) || 0;
          const card = document.createElement('div');
          card.className = 'book-card';
          
          const capaImg = leitura.capaUrl 
            ? `<img src="${leitura.capaUrl}" alt="${escapeHtml(leitura.tituloLivro)}" class="book-cover">`
            : `<div class="book-cover" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">📖</div>`;

          card.innerHTML = `
            ${capaImg}
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                <div>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">${escapeHtml(leitura.tituloLivro)}</h3>
                  <p style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(leitura.autor)}</p>
                </div>
                ${leitura.concluido ? '<span class="badge" style="background:#dcfce7;color:#15803d;">✔ Concluído</span>' : '<span class="badge">Em Leitura</span>'}
              </div>

              <!-- Barra de Progresso -->
              <div style="margin: 0.75rem 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
                  <span>Progresso: <strong>${leitura.paginasLidas}</strong> / ${leitura.totalPaginas} páginas</span>
                  <span><strong>${pct}%</strong></span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${pct}%;"></div>
                </div>
              </div>

              <!-- Ações: Atualizar Páginas e Avaliação -->
              <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; margin-top: 0.75rem;">
                <form class="form-atualizar-progresso" data-id="${leitura._id}" style="display: flex; gap: 0.5rem; align-items: center;">
                  <input 
                    type="number" 
                    min="0" 
                    max="${leitura.totalPaginas}" 
                    value="${leitura.paginasLidas}" 
                    class="form-control" 
                    style="width: 90px; padding: 0.35rem 0.5rem; font-size: 0.875rem;" 
                    required
                  >
                  <button type="submit" class="btn btn-outline btn-sm">Atualizar Pág.</button>
                </form>

                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Nota:</span>
                  <div class="stars-rating" data-id="${leitura._id}" data-concluido="${leitura.concluido}">
                    ${[1, 2, 3, 4, 5].map((star) => `
                      <span class="star ${leitura.avaliacao && leitura.avaliacao >= star ? 'active' : ''}" data-nota="${star}">★</span>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          `;
          listaLeituras.appendChild(card);
        });

        // Adicionar eventos aos formulários de atualização de progresso
        document.querySelectorAll('.form-atualizar-progresso').forEach((form) => {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const leituraId = form.getAttribute('data-id');
            const input = form.querySelector('input');
            const paginasLidas = Number(input.value);

            try {
              const res = await authFetch(`/api/leituras/${leituraId}/progresso`, {
                method: 'PATCH',
                body: JSON.stringify({ paginasLidas })
              });
              if (!res) return;
              const dataRes = await res.json();
              if (!res.ok) throw new Error(dataRes.mensagem || 'Erro ao atualizar páginas.');
              showNotification('Progresso salvo com sucesso!', 'success');
              await carregarDetalhesGrupo();
            } catch (err) {
              showNotification(err.message, 'error');
            }
          });
        });

        // Adicionar eventos às estrelas de avaliação
        document.querySelectorAll('.stars-rating').forEach((container) => {
          const leituraId = container.getAttribute('data-id');
          const concluido = container.getAttribute('data-concluido') === 'true';

          container.querySelectorAll('.star').forEach((starEl) => {
            starEl.addEventListener('click', async () => {
              if (!concluido) {
                showNotification('Você só pode avaliar um livro após concluir todas as páginas!', 'error');
                return;
              }

              const nota = Number(starEl.getAttribute('data-nota'));
              try {
                const res = await authFetch(`/api/leituras/${leituraId}/avaliar`, {
                  method: 'PATCH',
                  body: JSON.stringify({ avaliacao: nota })
                });
                if (!res) return;
                const dataRes = await res.json();
                if (!res.ok) throw new Error(dataRes.mensagem || 'Erro ao registrar avaliação.');
                showNotification(`Avaliação de ${nota} estrelas registrada!`, 'success');
                await carregarDetalhesGrupo();
              } catch (err) {
                showNotification(err.message, 'error');
              }
            });
          });
        });
      }

    } catch (error) {
      loadingRanking.style.display = 'none';
      loadingLeituras.style.display = 'none';
      showNotification('Erro ao carregar detalhes do grupo.', 'error');
    }
  }

  // ==========================================
  // BUSCA COM DEBOUNCE (500ms) - REGRA DO BACKLOG
  // ==========================================
  async function executarBuscaLivros(termo) {
    buscaSpinner.style.display = 'block';

    try {
      const response = await authFetch(`/api/livros/buscar?q=${encodeURIComponent(termo)}`);
      if (!response) return;

      const livros = await response.json();
      buscaSpinner.style.display = 'none';
      resultadosBusca.innerHTML = '';

      if (!Array.isArray(livros) || livros.length === 0) {
        resultadosBusca.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
            Nenhum livro encontrado para "${escapeHtml(termo)}".
          </div>
        `;
        resultadosBusca.style.display = 'block';
        return;
      }

      livros.forEach((livro) => {
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-bottom: 1px solid var(--border);
          background: #ffffff;
        `;

        const capa = livro.capaUrl
          ? `<img src="${livro.capaUrl}" alt="" style="width: 44px; height: 60px; object-fit: cover; border-radius: 4px;">`
          : `<div style="width: 44px; height: 60px; background: #e2e8f0; display:flex; align-items:center; justify-content:center; border-radius: 4px;">📖</div>`;

        item.innerHTML = `
          ${capa}
          <div style="flex: 1; min-width: 0;">
            <strong style="display: block; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(livro.tituloLivro)}
            </strong>
            <small style="color: var(--text-muted); display: block;">
              ${escapeHtml(livro.autor)} &bull; ${livro.totalPaginas > 0 ? livro.totalPaginas + ' páginas' : 'Páginas não informadas'}
            </small>
          </div>
          <button class="btn btn-primary btn-sm btn-adicionar-livro">
            + Adicionar
          </button>
        `;

        const btnAdd = item.querySelector('.btn-adicionar-livro');
        btnAdd.addEventListener('click', async () => {
          btnAdd.disabled = true;
          btnAdd.textContent = 'Adicionando...';
          await adicionarLivroAoGrupo(livro);
        });

        resultadosBusca.appendChild(item);
      });

      resultadosBusca.style.display = 'block';

    } catch (err) {
      buscaSpinner.style.display = 'none';
      showNotification('Erro ao pesquisar livros no catálogo.', 'error');
    }
  }

  // Aplicação da regra do Debounce de 500ms e mínimo de 2 caracteres
  const debouncedBuscar = debounce(async (termo) => {
    if (!termo || termo.trim().length <= 2) {
      resultadosBusca.style.display = 'none';
      resultadosBusca.innerHTML = '';
      buscaSpinner.style.display = 'none';
      return;
    }
    await executarBuscaLivros(termo.trim());
  }, 500);

  inputBuscaLivro.addEventListener('input', (e) => {
    const termo = e.target.value;
    if (termo.trim().length > 2) {
      buscaSpinner.style.display = 'block';
    } else {
      buscaSpinner.style.display = 'none';
      resultadosBusca.style.display = 'none';
    }
    debouncedBuscar(termo);
  });

  // Adicionar livro ao grupo
  async function adicionarLivroAoGrupo(livro) {
    let paginas = livro.totalPaginas;

    // Se o Google Books não trouxe páginas, solicita ao usuário
    if (!paginas || paginas <= 0) {
      const informada = prompt(`O livro "${livro.tituloLivro}" não tem total de páginas registrado. Digite o número de páginas da sua edição:`, "250");
      paginas = Number(informada);
      if (!paginas || isNaN(paginas) || paginas <= 0) {
        showNotification('Total de páginas inválido. Livro não adicionado.', 'error');
        return;
      }
    }

    try {
      const response = await authFetch(`/api/grupos/${grupoId}/leituras`, {
        method: 'POST',
        body: JSON.stringify({
          googleBookId: livro.googleBookId,
          tituloLivro: livro.tituloLivro,
          autor: livro.autor,
          capaUrl: livro.capaUrl,
          totalPaginas: paginas
        })
      });

      if (!response) return;

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao adicionar livro ao grupo.');
      }

      showNotification(`"${livro.tituloLivro}" adicionado com sucesso!`, 'success');
      inputBuscaLivro.value = '';
      resultadosBusca.style.display = 'none';
      resultadosBusca.innerHTML = '';

      await carregarDetalhesGrupo();

    } catch (err) {
      showNotification(err.message, 'error');
    }
  }

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

  // Inicializar dados do grupo
  await carregarDetalhesGrupo();
});
