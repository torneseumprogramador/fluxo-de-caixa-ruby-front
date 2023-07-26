import { useEffect, useState } from 'react';
import './App.css';


function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function App() {
  const apiUrl = process.env.REACT_APP_API_URL; // Acessa a variável de ambiente
  const [extrato, setExtrato] = useState([]);
  const [valor_total, setValorTotal] = useState([]);
  const [receita, setReceita] = useState([]);
  const [despesa, setDespesa] = useState([]);
  const [showForm, setShowForm] = useState(false); // Estado para controlar a exibição do formulário

  useEffect(() => {
    fetchCaixas();
  }, []);

  const fetchCaixas = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/caixas`);
      const data = await response.json();
      setListaCaixa(data);
    } catch (error) {
      console.error('Erro ao obter o extrato:', error);
    }
  };

  const setListaCaixa = (data) => {
    setExtrato(data.extrato);
    setValorTotal(data.valor_total);
    setReceita(data.receita);
    setDespesa(data.despesa);
  }

  const handleSearch = async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do submit

    const searchValue = document.querySelector("input[name='tipo']").value;
    try {
      const response = await fetch(`http://localhost:3001/api/caixas?tipo=${encodeURIComponent(searchValue)}`);
      const data = await response.json();
      setListaCaixa(data);
    } catch (error) {
      console.error('Erro ao buscar o extrato:', error);
    }
  };

  const handleDelete = async (id) => {
    if( window.confirm("Confirma?") ){
      try {
        await fetch(`http://localhost:3001/api/caixas/${id}`, {
          method: 'DELETE',
        });
        fetchCaixas(); // Atualiza a lista de extrato após a exclusão
      } catch (error) {
        console.error('Erro ao excluir o registro:', error);
      }
    }
  };

  const handleAdd = () => {
    setShowForm(true);
  };

  const handleCadastrar = async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do submit

    try {
      const tipo = document.querySelector(".formAdicionar input[name='tipo']").value;
      const valor = document.querySelector(".formAdicionar input[name='valor']").value;
      const status = document.querySelector(".formAdicionar select[name='status']").value;

      const response = await fetch(`${apiUrl}/api/caixas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: tipo,
          valor: valor,
          status: status,
        }),
      });
      if (response.ok) {
        setShowForm(false);
        fetchCaixas(); // Atualiza a lista de extrato após a adição
      } else {
        console.error('Erro ao adicionar o registro');
      }
    } catch (error) {
      console.error('Erro ao adicionar o registro:', error);
    }
  };

  return (
    <div>
      <div className="dvCaixas">
        <div>
          <b>Valor Total</b><br />
          R$ {extrato.length > 0 ? formatCurrency(valor_total) : '0,00'}
        </div>
        <div>
          <b>Receitas</b><br />
          R$ {extrato.length > 0 ? formatCurrency(receita) : '0,00'}
        </div>
        <div>
          <b>Despesas</b><br />
          - R$ {extrato.length > 0 ? formatCurrency(despesa) : '0,00'}
        </div>
      </div>

      <div className="dvBusca">
        <div>
          <form onSubmit={handleSearch}>
            <input type="text" className="form-control" placeholder="Digite algo" name="tipo" />
            <button type="submit" className="btn btn-primary">Buscar</button>
          </form>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleAdd}>Adicionar</button>
        </div>
      </div>

      {showForm && (
        <div className="formAdicionar">
          <form onSubmit={handleCadastrar}>
            <meta name="csrf-param" content="authenticity_token" />
            <meta name="csrf-token" content="hnE6TuhDQEf119hL3Vi3iZv7tS0a1qnxg2ZocqT2WP_PxfG8wiUEcgpKf8kMltGMbwqgAI3Gh1abUjd1WU-coA" />
            <div className="form-group">
              <label htmlFor="tipo">Tipo:</label>
              <input type="text" className="form-control" id="tipo" name="tipo" placeholder="Digite o tipo" />
            </div>
            <div className="form-group">
              <label htmlFor="valor">Valor:</label>
              <input type="number" step="0.01" className="form-control" id="valor" name="valor" placeholder="Digite o valor" />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status:</label>
              <select className="form-control" id="status" name="status">
                <option value="0">Entrada</option>
                <option value="1">Saída</option>
              </select>
            </div>
            <br />
            <button type="submit" className="btn btn-primary" onClick={handleAdd}>
              Salvar
            </button>
            {/* Botão para cancelar o cadastro e ocultar o formulário novamente */}
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      <div className="dvTabela">
        <table>
          <thead>
            <tr>
              <th scope="col">Tipo</th>
              <th scope="col">Valor</th>
              <th scope="col">Status</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {extrato.map(item => (
              <tr key={item.id}>
                <td>{item.tipo}</td>
                <td>R$ {formatCurrency(item.valor)}</td>
                <td style={{ backgroundColor: item.status === 0 ? "#75cceb" : "red" }}>{item.status === 0 ? "Crédito" : "Débito"}</td>
                <td style={{ width: "20px" }}>
                  <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
