import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartTokens } from './tokens.js';

const AXIS_FONT = { fontSize: 11, fontFamily: 'Inter, system-ui, sans-serif' };

/* Shared tooltip so every chart in the portal reads the same way. */
function ChartTooltip({ active, payload, label, suffix = '', formatter }) {
  const t = useChartTokens();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lift"
      style={{ background: t.surface, border: `1px solid ${t.tooltipBorder}`, color: t.ink }}
    >
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey ?? entry.name} className="flex items-center gap-2 tabular-nums">
          <span className="size-2 rounded-full" style={{ background: entry.color || entry.fill }} aria-hidden="true" />
          <span className="text-ink-500 dark:text-ink-400">{entry.name}</span>
          <span className="ml-auto font-semibold">
            {formatter ? formatter(entry.value) : `${entry.value}${suffix}`}
          </span>
        </p>
      ))}
    </div>
  );
}

const legendStyle = { fontSize: 12, paddingTop: 8 };

/* ------------------------------------------------------------------ */
/** Single-series magnitude bars — attendance, class strength, counts. */
export function BarSeriesChart({
  data,
  xKey,
  yKey,
  name,
  height = 240,
  suffix = '',
  domain,
  threshold,
  colorBy,
  grow = false,
}) {
  const t = useChartTokens();
  return (
    <div className={grow ? 'min-h-[240px] flex-1' : undefined} style={grow ? undefined : { height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ ...AXIS_FONT, fill: t.axis }} tickLine={false} axisLine={false} interval={0} />
          <YAxis
            tick={{ ...AXIS_FONT, fill: t.axis }}
            tickLine={false}
            axisLine={false}
            domain={domain || [0, 'auto']}
            width={44}
          />
          <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={{ fill: t.grid }} />
          {threshold !== undefined && (
            <ReferenceLine
              y={threshold}
              stroke={t.status.warning}
              strokeWidth={2}
              strokeDasharray="5 4"
              ifOverflow="extendDomain"
            />
          )}
          <Bar dataKey={yKey} name={name} radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive>
            {data.map((entry, index) => (
              <Cell
                key={entry[xKey] ?? index}
                fill={colorBy ? colorBy(entry, t) : t.series1}
                stroke={t.surface}
                strokeWidth={2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Two-series comparison — always legended, hues assigned in fixed order. */
export function GroupedBarChart({ data, xKey, series, height = 260, suffix = '' }) {
  const t = useChartTokens();
  const colors = [t.series1, t.series2];
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="24%" barGap={2}>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ ...AXIS_FONT, fill: t.axis }} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={{ ...AXIS_FONT, fill: t.axis }} tickLine={false} axisLine={false} width={44} />
          <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={{ fill: t.grid }} />
          <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
          {series.map((s, index) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={26}
              stroke={t.surface}
              strokeWidth={2}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Change over time — single measure, one axis. */
export function TrendChart({ data, xKey, yKey, name, height = 240, suffix = '', domain, area = true }) {
  const t = useChartTokens();
  const Chart = area ? AreaChart : LineChart;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.series1} stopOpacity={0.26} />
              <stop offset="100%" stopColor={t.series1} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ ...AXIS_FONT, fill: t.axis }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ ...AXIS_FONT, fill: t.axis }}
            tickLine={false}
            axisLine={false}
            domain={domain || ['auto', 'auto']}
            width={44}
          />
          <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={{ stroke: t.axis, strokeWidth: 1, strokeDasharray: '4 4' }} />
          {area ? (
            <Area
              type="monotone"
              dataKey={yKey}
              name={name}
              stroke={t.series1}
              strokeWidth={2}
              fill="url(#trendFill)"
              dot={{ r: 3, strokeWidth: 2, stroke: t.surface, fill: t.series1 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: t.surface }}
            />
          ) : (
            <Line
              type="monotone"
              dataKey={yKey}
              name={name}
              stroke={t.series1}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, stroke: t.surface, fill: t.series1 }}
              activeDot={{ r: 5 }}
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

/** Five comparable 1–5 ratings — one series, so no legend box is needed. */
export function RatingRadar({ data, height = 250 }) {
  const t = useChartTokens();
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={t.grid} />
          <PolarAngleAxis dataKey="label" tick={{ ...AXIS_FONT, fill: t.axis }} />
          <PolarRadiusAxis domain={[0, 5]} tick={{ ...AXIS_FONT, fill: t.axis }} axisLine={false} tickCount={6} />
          <Tooltip content={<ChartTooltip suffix=" / 5" />} />
          <Radar name="Average rating" dataKey="value" stroke={t.series1} strokeWidth={2} fill={t.series1} fillOpacity={0.22} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Part-to-whole for one quantity split two ways (collected vs outstanding).
 * Rendered as a single stacked bar with a 2px surface gap and direct labels —
 * easier to read against an axis than a pie.
 */
export function SplitBar({ segments, total, formatValue = (v) => v }) {
  const t = useChartTokens();
  const colors = [t.series1, t.neutral];
  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
        {segments.map((segment, index) => {
          const share = total ? (segment.value / total) * 100 : 0;
          return (
            <span
              key={segment.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${Math.max(share, segment.value > 0 ? 1.5 : 0)}%`, background: colors[index % colors.length] }}
              title={`${segment.label}: ${formatValue(segment.value)}`}
            />
          );
        })}
      </div>
      <dl className="mt-3 space-y-1.5">
        {segments.map((segment, index) => (
          <div key={segment.label} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: colors[index % colors.length] }} aria-hidden="true" />
            <dt className="text-[0.8125rem] text-ink-500 dark:text-ink-400">{segment.label}</dt>
            <dd className="ml-auto text-sm font-semibold tabular-nums">{formatValue(segment.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
