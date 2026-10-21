import axios from 'axios';

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


