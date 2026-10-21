/*import axios from 'axios';

export interface LivroGoogleBooks {
  googleBookId: string;
  tituloLivro: string;
  autor: string;
  capaUrl: string;
  totalPaginas: number;
}

export class GoogleBooksService {
  async buscarLivros(termo: string): Promise<LivroGoogleBooks[]> {
    if (!termo || termo.trim().length === 0) {
      return [];
    }

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termo.trim())}&maxResults=10`;

    // Se houver uma chave válida e não placeholder
    if (apiKey && apiKey !== 'cole_aqui_a_sua_api_key_do_google_books') {
      url += `&key=${apiKey}`;
    }

    try {
      const response = await axios.get(url, { timeout: 8000 });
      const items = response.data.items || [];

      return items.map((item: any): LivroGoogleBooks => {
        const volumeInfo = item.volumeInfo || {};
        const thumbnail =
          volumeInfo.imageLinks?.thumbnail ||
          volumeInfo.imageLinks?.smallThumbnail ||
          '';

        // Garantir protocolo HTTPS na imagem para evitar mixed content
        const capaHttps = thumbnail ? thumbnail.replace(/^http:\/\//i, 'https://') : '';

        return {
          googleBookId: item.id || '',
          tituloLivro: volumeInfo.title || 'Sem título',
          autor: Array.isArray(volumeInfo.authors)
            ? volumeInfo.authors.join(', ')
            : 'Autor Desconhecido',
          capaUrl: capaHttps,
          totalPaginas: Number(volumeInfo.pageCount) || 0,
        };
      });
    } catch (error: any) {
      console.error('❌ [GoogleBooksService] Erro ao buscar na API do Google Books:', error.message);
      throw new Error(`Falha ao consultar o catálogo de livros: ${error.message}`);
    }
  }
}

export const googleBooksService = new GoogleBooksService();
*/

import axios from 'axios'; // Ou podes usar fetch nativo do Node.js

export async function buscarLivrosNoGoogle(termo: string) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  // Passo de segurança educativo: Verifica se a chave existe no .env
  if (!apiKey) {
    throw new Error("A variável GOOGLE_BOOKS_API_KEY não está definida no ficheiro .env!");
  }

  try {
    // Construção correta do URL incluindo a chave de API exigida pelo Google
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termo.trim())}&maxResults=10&key=${apiKey}`;

    // Executando a requisição GET
    const resposta = await axios.get(url);

    // Retorna os itens encontrados (ou um array vazio se não vier nada)
    return resposta.data.items || [];
    
  } catch (erro: any) {
    // Registo detalhado para sabermos exatamente se o erro persiste no servidor do Google
    console.error("Erro ao comunicar com a API do Google Books:", erro.response?.data || erro.message);
    throw new Error("Não foi possível concluir a busca de livros neste momento.");
  }
}