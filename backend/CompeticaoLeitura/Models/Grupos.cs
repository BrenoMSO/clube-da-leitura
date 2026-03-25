namespace CompeticaoLeitura.Models;

public class Grupo
{
    public int IdGrupo { get; set;}

    public int IdUsuario { get; set;}
    
    public string Nome { get; set;}

    public DateTime DataInicio { get; set;}

    public DateTime? DataFim { get; set;}

    public string Status {get; set;}

    
}