namespace CompeticaoLeitura.Models;

public class Leitura
{
    public int IdLeitura { get; set; }

    public int IdUsuario { get; set; }

    public int IdGrupo { get; set; }

    public string TituloLivro { get; set; }

    public int PaginasLidas { get; set;}

    public DateTime DataLeitura { get; set;}

    
}