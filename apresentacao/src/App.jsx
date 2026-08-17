import { useState, useEffect } from "react";
import dataLocal from "../../scripts/resultados.json";
import {
  LayoutDashboard,
  Server,
  Cpu,
  Clock,
  TrendingDown,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileBox,
  Layers,
  Timer,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  highlight,
  badge,
}) => (
  <div
    className={`bg-white p-6 rounded-[2rem] border ${highlight ? "border-[#4D7BAB] shadow-lg shadow-[#4D7BAB]/10" : "border-slate-200"} transition-colors relative overflow-hidden flex flex-col justify-between`}
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>

    <div>
      <div className="flex items-end gap-3">
        <p
          className={`text-4xl font-extrabold ${highlight ? "text-[#4D7BAB]" : "text-slate-800"}`}
        >
          {value}
        </p>
        {badge && (
          <span className="mb-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-bold">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-slate-500 font-medium mt-2">{subtitle}</p>
      )}
    </div>
  </div>
);

export default function App() {
  const [dadosGlobais, setDadosGlobais] = useState(null);
  const [instanciaIndex, setInstanciaIndex] = useState("geral");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarDados = () => {
      try {
        setDadosGlobais(dataLocal);
      } catch {
        setError("Não foi possível carregar o benchmark.");
      } finally {
        setLoading(false);
      }
    };

    setTimeout(carregarDados, 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#4D7BAB]/30 border-t-[#4D7BAB] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold">Analisando cluster...</p>
      </div>
    );
  }

  if (error || !dadosGlobais) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      </div>
    );
  }

  const calcularReducaoPercentual = (tempoMaior, tempoMenor) => {
    if (tempoMaior === 0) return 0;
    const reducao = ((tempoMaior - tempoMenor) / tempoMaior) * 100;
    return reducao.toFixed(1);
  };

  const isGeral = instanciaIndex === "geral";
  const dados = isGeral ? null : dadosGlobais.resultados[instanciaIndex];

  let tempoTotalIsolada = 0;
  let tempoTotalCluster = 0;
  let tempoTotalEconomizado = 0;
  let graficoGeral = [];

  if (isGeral) {
    dadosGlobais.resultados.forEach((res) => {
      const tempoIso = res.maquina_isolada.tempo_execucao_segundos || 0;
      const tempoClus = res.cluster_dask.tempo_execucao_segundos || 0;

      tempoTotalIsolada += tempoIso;
      tempoTotalCluster += tempoClus;
    });
    tempoTotalEconomizado = tempoTotalIsolada - tempoTotalCluster;

    graficoGeral = [
      {
        name: "Soma Total (Isolada)",
        tempo: parseFloat(tempoTotalIsolada.toFixed(1)),
        fill: "#94a3b8",
      },
      {
        name: "Soma Total (Cluster)",
        tempo: parseFloat(tempoTotalCluster.toFixed(1)),
        fill: "#10b981",
      },
    ];
  }

  const porcentagemExibida = isGeral
    ? calcularReducaoPercentual(tempoTotalIsolada, tempoTotalCluster)
    : calcularReducaoPercentual(
        dados.maquina_isolada.tempo_execucao_segundos || 0,
        dados.cluster_dask.tempo_execucao_segundos || 0,
      );

  const multiplicadorExibido = isGeral
    ? tempoTotalCluster > 0
      ? (tempoTotalIsolada / tempoTotalCluster).toFixed(2)
      : 0
    : dados.ganho_desempenho_vezes || 0;

  const graficoEspecifico = !isGeral
    ? [
        {
          name: "Máquina Isolada",
          tempo: dados.maquina_isolada.tempo_execucao_segundos || 0,
          fill: "#94a3b8",
        },
        {
          name: "Cluster Dask",
          tempo: dados.cluster_dask.tempo_execucao_segundos || 0,
          fill: "#10b981",
        },
      ]
    : [];

  const dadosDoGraficoAtual = isGeral ? graficoGeral : graficoEspecifico;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                Benchmark do Sistema
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {dadosGlobais.projeto} • {dadosGlobais.algoritmo}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {isGeral ? <Layers size={18} /> : <FileBox size={18} />}
              </div>
              <select
                value={instanciaIndex}
                onChange={(e) =>
                  setInstanciaIndex(
                    e.target.value === "geral"
                      ? "geral"
                      : Number(e.target.value),
                  )
                }
                className="pl-12 pr-6 py-3 w-full rounded-2xl text-sm font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#4D7BAB] transition-all cursor-pointer shadow-sm appearance-none min-w-[240px]"
              >
                <option value="geral">Panorama Geral (Soma de Todas)</option>
                {dadosGlobais.resultados.map((res, index) => (
                  <option key={index} value={index}>
                    Instância Individual: {res.instancia.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 w-full sm:w-auto justify-center whitespace-nowrap">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">
                {isGeral
                  ? dadosGlobais.resultados[0]?.cluster_dask.nos_ativos || 0
                  : dados?.cluster_dask.nos_ativos || 0}{" "}
                Nós Ativos
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title={isGeral ? "Soma Total (Isolada)" : "Máquina Isolada"}
            value={`${isGeral ? tempoTotalIsolada.toFixed(1) : dados.maquina_isolada.tempo_execucao_segundos || 0}s`}
            subtitle={
              isGeral
                ? `Tempo somado nas ${dadosGlobais.resultados.length} instâncias`
                : "Processamento Sequencial"
            }
            icon={isGeral ? Layers : Cpu}
            colorClass="bg-slate-100 text-slate-600"
          />
          <MetricCard
            title={isGeral ? "Soma Total (Cluster)" : "Cluster Dask"}
            value={`${isGeral ? tempoTotalCluster.toFixed(1) : dados.cluster_dask.tempo_execucao_segundos || 0}s`}
            subtitle={
              isGeral
                ? `Tempo somado nas ${dadosGlobais.resultados.length} instâncias`
                : "Processamento Paralelo"
            }
            icon={isGeral ? Layers : Server}
            colorClass="bg-emerald-100 text-emerald-600"
          />
          <MetricCard
            title={isGeral ? "Tempo Total Economizado" : "Ganho de Desempenho"}
            value={
              isGeral
                ? `${tempoTotalEconomizado.toFixed(1)}s`
                : `${multiplicadorExibido}x`
            }
            subtitle={
              isGeral
                ? `Aceleração média de ${multiplicadorExibido}x mais rápido`
                : "Mais rápido distribuindo a carga"
            }
            badge={`-${porcentagemExibida}% tempo`}
            icon={isGeral ? Timer : Zap}
            colorClass="bg-blue-100 text-[#4D7BAB]"
            highlight={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-colors">
            <h3 className="font-bold text-slate-700 mb-8 flex items-center gap-2">
              <Clock size={20} className="text-[#4D7BAB]" />
              {isGeral
                ? "Comparativo de Tempo Somado (Isolada vs Cluster)"
                : `Comparativo de Tempo na ${dados.instancia.toUpperCase()}`}
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosDoGraficoAtual}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-slate-100"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: "14px", fontWeight: "bold" }}
                    stroke="currentColor"
                    className="text-slate-500"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: "12px" }}
                    tickFormatter={(val) => `${val}s`}
                    stroke="currentColor"
                    className="text-slate-400"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(241, 245, 249, 0.5)" }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      color: "#334155",
                      fontWeight: "bold",
                    }}
                    formatter={(value) => [
                      `${value} Segundos`,
                      isGeral ? "Tempo Somado" : "Tempo",
                    ]}
                  />
                  <Bar dataKey="tempo" radius={[8, 8, 0, 0]} maxBarSize={150}>
                    {dadosDoGraficoAtual.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-colors flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                <TrendingDown size={20} className="text-emerald-500" />
                {isGeral
                  ? "Métricas do Panorama Geral"
                  : "Validação de Resultados"}
              </h3>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                    {isGeral
                      ? "Total de Instâncias Processadas"
                      : "Makespan Encontrado"}
                  </span>
                  <p className="text-3xl font-black text-slate-800">
                    {isGeral
                      ? dadosGlobais.resultados.length
                      : dados.maquina_isolada.melhor_makespan || "-"}
                  </p>
                </div>

                <div className="w-full h-[1px] bg-slate-100"></div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                    {isGeral
                      ? "Tecnologia de Distribuição"
                      : "Vizinhanças Testadas"}
                  </span>
                  <p className="text-xl font-bold text-slate-800">
                    {isGeral
                      ? "Dask Clusterizado"
                      : `${dados.tamanho_vizinhanca || 0} permutações`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-sm font-bold text-amber-700 leading-relaxed">
                {isGeral
                  ? "Em todas as matrizes avaliadas, a soma total comprova a eficiência da distribuição paralela para problemas complexos de Open Shop."
                  : `Os resultados de makespan foram validados na instância ${dados.instancia}, garantindo a integridade da distribuição.`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden transition-colors">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">
              {isGeral
                ? "Lista de Instâncias Processadas e Somadas"
                : `Distribuição de Carga (${dados.instancia.toUpperCase()})`}
            </h3>
            {isGeral && (
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Soma Realizada: {dadosGlobais.resultados.length} matrizes
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">
                    {isGeral ? "Instância Fatiada" : "Lote Fatiado"}
                  </th>
                  <th className="px-6 py-4">Tempo (Isolada)</th>
                  <th className="px-6 py-4">Tempo (Cluster)</th>
                  <th className="px-6 py-4">Melhoria</th>
                  <th className="px-6 py-4">
                    {isGeral ? "Aceleração" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isGeral
                  ? dadosGlobais.resultados.map((res, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-slate-700 uppercase">
                          {res.instancia}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">
                          {res.maquina_isolada.tempo_execucao_segundos || 0}s
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          {res.cluster_dask.tempo_execucao_segundos || 0}s
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          -
                          {calcularReducaoPercentual(
                            res.maquina_isolada.tempo_execucao_segundos || 0,
                            res.cluster_dask.tempo_execucao_segundos || 0,
                          )}
                          %
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold border uppercase bg-blue-50 text-blue-700 border-blue-200">
                            {res.ganho_desempenho_vezes || 0}x
                          </span>
                        </td>
                      </tr>
                    ))
                  : dados.historico_lotes.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                          {row.lote}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">
                          {row.tempo_isolada || 0}s
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          {row.tempo_cluster || 0}s
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          -
                          {calcularReducaoPercentual(
                            row.tempo_isolada || 0,
                            row.tempo_cluster || 0,
                          )}
                          %
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold border uppercase bg-slate-100 text-slate-600 border-slate-200">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
