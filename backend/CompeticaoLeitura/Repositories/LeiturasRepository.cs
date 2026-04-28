using Dapper;
using Microsoft.Data.Sqlite;
using CompeticaoLeitura.Models;

namespace CompeticaoLeitura.Repositories;

public class LeiturasRepository
{
    private readonly IConfiguration _configuracao;

    public LeiturasRepository(IConfiguration configuracaoCSharp)
    {
        _configuracao = configuracaoCSharp;

    }

    public IEnumerable<Leiuras> BuscarLeituras()
    {
        using (var conexao = new SqliteConnection)
    }
}