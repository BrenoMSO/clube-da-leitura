using Dapper;
using Microsoft.Data.Sqlite;
using CompeticaoLeitura.Models;

namespace CompeticaoLeitura.Repositories;


public class UsuarioRepository
{
    private readonly IConfiguration _configuracao;

    public UsuarioRepository(IConfiguration configuracaoCSharp)
    {
        _configuracao = configuracaoCSharp;
    }
    public IEnumerable<Usuario> BuscarTodos()
    {
        using (var conexao = new SqliteConnection(_configuracao.GetConnectionString("Minha Conexão")))
        {
            string sql = "SELECT * FROM Usuarios";
            return conexao.Query<Usuario>(sql);
        }   
    }
}