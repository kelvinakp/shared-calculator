"use client";

import { useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";

const innerLabelPlugin = {
  id: "innerLabel",
  afterDatasetsDraw: (chart: ChartJS, _args: unknown, options: unknown) => {
    const { ctx, data } = chart;
    const dataset = data.datasets[0];
    const meta = chart.getDatasetMeta(0);

    if (!dataset || !meta?.data?.length) {
      return;
    }

    const labels = (data.labels as string[]) ?? [];
    const values = (dataset.data as number[]) ?? [];
    const mode = (options as { mode?: ChartMode })?.mode ?? "percentage";

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 11px \"Padauk\", sans-serif";

    meta.data.forEach((element, index) => {
      const arc = element as unknown as {
        startAngle: number;
        endAngle: number;
        innerRadius: number;
        outerRadius: number;
        x: number;
        y: number;
      };

      const angle = arc.endAngle - arc.startAngle;
      if (angle < 0.2) {
        return;
      }

      const radius = (arc.innerRadius + arc.outerRadius) / 2;
      const midAngle = (arc.startAngle + arc.endAngle) / 2;
      const x = arc.x + Math.cos(midAngle) * radius;
      const y = arc.y + Math.sin(midAngle) * radius;
      const value = Number(values[index] ?? 0);

      if (value <= 0) {
        return;
      }

      const labelText =
        mode === "percentage" ? `${value.toFixed(1)}%` : value.toLocaleString();
      ctx.fillText(labelText, x, y);
    });

    ctx.restore();
  },
};

ChartJS.register(ArcElement, Tooltip, Legend, Title, innerLabelPlugin);

type Investor = {
  id: string;
  name: string;
  amount: number;
};

type ChartMode = "percentage" | "amount";

const SLICE_COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#A855F7",
  "#14B8A6",
  "#F97316",
];

export default function Home() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [totalReturn, setTotalReturn] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("percentage");

  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const totalFund = useMemo(
    () => investors.reduce((sum, investor) => sum + investor.amount, 0),
    [investors]
  );

  const totalReturnValue = useMemo(() => {
    const parsed = Number(totalReturn);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [totalReturn]);

  const newAmountValue = useMemo(() => {
    const parsed = Number(newAmount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [newAmount]);

  const totalProfit = useMemo(
    () => totalReturnValue - totalFund,
    [totalReturnValue, totalFund]
  );

  const calculatedRows = useMemo(() => {
    if (totalFund <= 0) {
      return investors.map((investor) => ({
        ...investor,
        sharePercentage: 0,
        profitShare: 0,
        totalPayout: investor.amount,
      }));
    }

    return investors.map((investor) => {
      const sharePercentage = (investor.amount / totalFund) * 100;
      const profitShare = (sharePercentage / 100) * totalProfit;
      const totalPayout = investor.amount + profitShare;
      return { ...investor, sharePercentage, profitShare, totalPayout };
    });
  }, [investors, totalFund, totalProfit]);

  const chartData = useMemo(() => {
    const labels = calculatedRows.map((row) => row.name || row.id);
    const values =
      chartMode === "percentage"
        ? calculatedRows.map((row) => row.sharePercentage)
        : calculatedRows.map((row) => row.totalPayout);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map(
            (_, index) => SLICE_COLORS[index % SLICE_COLORS.length]
          ),
          borderWidth: 0,
        },
      ],
    };
  }, [calculatedRows, chartMode]);

  const chartTitle =
    chartMode === "percentage"
      ? "ပိုင်ဆိုင်မှုရာခိုင်နှုန်း"
      : "စုစုပေါင်း ရရှိမည့်ငွေ";

  const chartOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            boxWidth: 14,
            boxHeight: 14,
            padding: 14,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"pie">) => {
              const rawValue = Number(context.raw || 0);
              if (chartMode === "percentage") {
                return `${context.label}: ${rawValue.toFixed(2)}%`;
              }
              return `${context.label}: ${rawValue.toLocaleString()}`;
            },
          },
        },
        title: {
          display: true,
          text: chartTitle,
          color: "#0f172a",
          font: {
            size: 14,
            weight: "600",
          },
          padding: {
            bottom: 16,
          },
        },
        innerLabel: {
          mode: chartMode,
        },
      },
    }),
    [chartMode, chartTitle]
  );

  const handleAddInvestor = () => {
    if (!newName.trim() || newAmountValue <= 0) {
      return;
    }

    setInvestors((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: newName.trim(),
        amount: newAmountValue,
      },
    ]);
    setNewName("");
    setNewAmount("");
    setHasCalculated(false);
  };

  const handleRemoveInvestor = (id: string) => {
    setInvestors((prev) => prev.filter((investor) => investor.id !== id));
    setHasCalculated(false);
  };

  const handleCalculate = () => {
    setHasCalculated(true);
  };

  return (
    <div className="flex flex-1 items-center justify-center px-3 py-10 sm:px-6 lg:px-8">
      <main className="w-full max-w-5xl rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5 sm:p-10 lg:p-12">
        <header className="text-center">
          <h1 className="text-2xl font-semibold leading-loose text-slate-900 sm:text-3xl">
            ရှယ်ယာနှင့် အမြတ်ငွေ တွက်ချက်မှု
          </h1>
          <p className="mt-2 text-sm leading-loose text-slate-500 sm:text-base">
            အဖွဲ့လိုက် ရင်းနှီးမြှုပ်နှံသူများအတွက် အမြတ်ခွဲဝေပေးသည့် နည်းလမ်းကို
            လွယ်ကူစွာ တွက်ချက်နိုင်ပါတယ်။
          </p>
        </header>

        <section className="mt-10 space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
            <label className="block text-sm font-medium leading-loose text-slate-700">
              စုစုပေါင်း ရန်ပုံငွေ + အမြတ်
            </label>
            <input
              type="number"
              min={0}
              value={totalReturn}
              onChange={(event) => setTotalReturn(event.target.value)}
              placeholder="0"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base leading-loose text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end">
            <div>
              <label className="block text-sm font-medium leading-loose text-slate-700">
                အမည် / ID
              </label>
              <input
                type="text"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="ဥပမာ - Aung Aung"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base leading-loose text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium leading-loose text-slate-700">
                ထည့်ဝင်ငွေ
              </label>
              <input
                type="number"
                min={0}
                value={newAmount}
                onChange={(event) => setNewAmount(event.target.value)}
                placeholder="0"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base leading-loose text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button
              type="button"
              onClick={handleAddInvestor}
              className="h-12 rounded-xl bg-slate-900 px-6 text-base font-medium leading-loose text-white shadow-md transition hover:bg-slate-800"
            >
              လူထည့်ရန်
            </button>
          </div>

          <div className="space-y-3">
            {investors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm leading-loose text-slate-500">
                ရင်းနှီးမြှုပ်နှံသူကို ထည့်သွင်းရန် အပေါ်က အချက်အလက်များကို ဖြည့်ပါ။
              </div>
            ) : (
              investors.map((investor) => (
                <div
                  key={investor.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-base font-medium leading-loose text-slate-900">
                      {investor.name}
                    </p>
                    <p className="text-sm leading-loose text-slate-500">
                      ထည့်ဝင်ငွေ - {investor.amount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInvestor(investor.id)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium leading-loose text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    ဖျက်ရန်
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-semibold leading-loose text-white shadow-lg transition hover:bg-emerald-500"
          >
            တွက်မည်
          </button>
        </section>

        {hasCalculated && (
          <section className="mt-12 space-y-10">
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-sm leading-loose text-slate-700 sm:grid-cols-2">
              <div>
                <span className="text-slate-500">စုစုပေါင်း ရန်ပုံငွေ</span>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {totalFund.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-500">စုစုပေါင်း အမြတ်ငွေ</span>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {totalProfit.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium leading-loose sm:px-6">
                      အမည်
                    </th>
                    <th className="px-4 py-3 font-medium leading-loose sm:px-6">
                      ထည့်ဝင်ငွေ
                    </th>
                    <th className="px-4 py-3 font-medium leading-loose sm:px-6">
                      ပိုင်ဆိုင်မှုရာခိုင်နှုန်း
                    </th>
                    <th className="px-4 py-3 font-medium leading-loose sm:px-6">
                      ရရှိမည့်အမြတ်ငွေ
                    </th>
                    <th className="px-4 py-3 font-medium leading-loose sm:px-6">
                      စုစုပေါင်း ရရှိမည့်ငွေ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {calculatedRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 leading-loose text-slate-900 sm:px-6">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 leading-loose text-slate-700 sm:px-6">
                        {row.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 leading-loose text-slate-700 sm:px-6">
                        {row.sharePercentage.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 leading-loose text-slate-700 sm:px-6">
                        {row.profitShare.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 leading-loose text-slate-900 sm:px-6">
                        {row.totalPayout.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setChartMode("percentage")}
                  className={`rounded-full px-4 py-2 text-sm font-medium leading-loose transition ${
                    chartMode === "percentage"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  ရာခိုင်နှုန်းဖြင့်ပြရန်
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("amount")}
                  className={`rounded-full px-4 py-2 text-sm font-medium leading-loose transition ${
                    chartMode === "amount"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  ပမာဏဖြင့်ပြရန်
                </button>
              </div>

              <div className="mt-6 flex min-h-[260px] items-center justify-center sm:min-h-[320px]">
                <div className="w-full max-w-[360px] sm:max-w-[440px]">
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
