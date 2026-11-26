"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Bell,
  Check,
  Download,
  Home,
  Layers,
  Moon,
  Search,
  Settings2,
  Sun,
  Target,
  Wallet,
  X,
  ChartNoAxesCombined,
  CreditCard,
  Coffee,
  ShoppingBag,
  Building2,
  Plane,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

export type GlassSettings = {
  blur: number;
  opacity: number;
  saturation: number;
  tint: string;
  edge: number;
};
export type WorkspaceTransaction = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  status: "Completed" | "Pending";
};
export type WorkspaceGoal = {
  id: string;
  name: string;
  saved: number;
  target: number;
  color?: string;
};
export type WorkspaceCashFlowPoint = {
  label: string;
  /** Nonnegative amounts in the selected currency, not cumulative balances. */
  income: number;
  expenses: number;
};
export type WorkspaceCashFlowPeriod = {
  id: string;
  label: string;
  points: WorkspaceCashFlowPoint[];
  description?: string;
};
export type WorkspaceAccount = { name: string; lastFour?: string };
export type WorkspaceBalanceChange = { percent: number; label: string };
export interface GlassWorkspaceProps {
  brand?: string;
  userName?: string;
  backgroundImage?: string;
  balance?: number;
  balanceChange?: WorkspaceBalanceChange;
  account?: WorkspaceAccount;
  periodLabel?: string;
  cashFlowPeriods?: WorkspaceCashFlowPeriod[];
  initialPeriodId?: string;
  footerNote?: string;
  savingsNote?: string;
  transactions?: WorkspaceTransaction[];
  goals?: WorkspaceGoal[];
  glass?: Partial<GlassSettings>;
  onGlassChange?: (settings: GlassSettings) => void;
  currency?: string;
  theme?: "system" | "light" | "dark";
  /** Inherit complete Tailwind v4 --color-* tokens. The host owns theme switching. */
  useHostTheme?: boolean;
  className?: string;
  style?: CSSProperties;
}

const defaults: GlassSettings = {
  blur: 22,
  opacity: 0.3,
  saturation: 1.2,
  tint: "#ffffff",
  edge: 0.6,
};
const tabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "activity", label: "Activity", icon: Wallet },
  { id: "savings", label: "Savings", icon: Target },
  { id: "reports", label: "Reports", icon: ChartNoAxesCombined },
] as const;
type View = (typeof tabs)[number]["id"];
const bounded = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const normalize = (v: Partial<GlassSettings>): GlassSettings => ({
  blur: bounded(v.blur ?? defaults.blur, 0, 40, defaults.blur),
  opacity: bounded(v.opacity ?? defaults.opacity, 0.08, 0.9, defaults.opacity),
  saturation: bounded(
    v.saturation ?? defaults.saturation,
    0.5,
    2,
    defaults.saturation,
  ),
  edge: bounded(v.edge ?? defaults.edge, 0, 1, defaults.edge),
  tint: /^#[0-9a-f]{6}$/i.test(v.tint ?? "") ? v.tint! : defaults.tint,
});
const nonnegative = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;
const goalProgress = (goal: WorkspaceGoal) =>
  goal.target > 0 ? bounded((goal.saved / goal.target) * 100, 0, 100, 0) : 0;

function IconFor({ category }: { category: string }) {
  const Icon =
    category === "Income"
      ? ArrowDownLeft
      : category === "Dining"
        ? Coffee
        : category === "Travel"
          ? Plane
          : category === "Shopping"
            ? ShoppingBag
            : Building2;
  return <Icon size={17} strokeWidth={1.7} aria-hidden="true" />;
}

export default function GlassWorkspace({
  brand = "Workspace",
  userName,
  backgroundImage,
  balance = 0,
  balanceChange,
  account,
  periodLabel,
  cashFlowPeriods = [],
  initialPeriodId,
  footerNote,
  savingsNote,
  transactions = [],
  goals = [],
  glass = defaults,
  onGlassChange,
  currency = "USD",
  theme = "system",
  useHostTheme = true,
  className = "",
  style,
}: GlassWorkspaceProps) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const settingsTrigger = useRef<HTMLButtonElement>(null);
  const id = useId().replace(/:/g, "");
  const [view, setView] = useState<View>("overview");
  const [material, setMaterial] = useState(() => normalize(glass));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localTheme, setLocalTheme] = useState(theme);
  const [periodId, setPeriodId] = useState(
    initialPeriodId ?? cashFlowPeriods[0]?.id ?? "",
  );
  const [filter, setFilter] = useState("");
  const [notice, setNotice] = useState("");
  const [alerts, setAlerts] = useState(false);
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  useEffect(
    () => setMaterial(normalize(glass)),
    [glass.blur, glass.opacity, glass.saturation, glass.tint, glass.edge],
  );
  useEffect(() => setLocalTheme(theme), [theme]);
  useEffect(() => {
    if (initialPeriodId !== undefined) setPeriodId(initialPeriodId);
  }, [initialPeriodId]);
  useEffect(() => {
    if (settingsOpen)
      root.current
        ?.querySelector<HTMLButtonElement>(".gw-material button")
        ?.focus();
  }, [settingsOpen]);
  useEffect(() => setBackgroundFailed(false), [backgroundImage]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const money = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      });
    } catch {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
    }
  }, [currency]);
  const format = (v: number) => money.format(Number.isFinite(v) ? v : 0);
  const spent = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum - t.amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + Math.max(0, g.saved), 0);
  const visibleTransactions = transactions.filter((t) =>
    `${t.name} ${t.category}`.toLowerCase().includes(filter.toLowerCase()),
  );
  const selectedPeriod =
    cashFlowPeriods.find((item) => item.id === periodId) ?? cashFlowPeriods[0];
  const points = selectedPeriod?.points ?? [];
  const income = points.reduce(
    (sum, point) => sum + nonnegative(point.income),
    0,
  );
  const expenses = points.reduce(
    (sum, point) => sum + nonnegative(point.expenses),
    0,
  );
  const chartMaximum = Math.max(
    1,
    ...points.flatMap((point) => [
      nonnegative(point.income),
      nonnegative(point.expenses),
    ]),
  );
  const chartX = (index: number) =>
    points.length === 1 ? 300 : (index * 600) / (points.length - 1);
  const chartY = (value: number) =>
    180 - (nonnegative(value) / chartMaximum) * 160;
  const linePoints = (key: "income" | "expenses") =>
    points
      .map((point, index) => `${chartX(index)},${chartY(point[key])}`)
      .join(" ");
  const chartLabelIndices = new Set(
    Array.from({ length: Math.min(points.length, 6) }, (_, index) =>
      points.length <= 6
        ? index
        : Math.round((index * (points.length - 1)) / 5),
    ),
  );
  const spendingCategories = Array.from(
    new Set(
      transactions
        .filter((item) => item.amount < 0)
        .map((item) => item.category),
    ),
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = content.current?.querySelectorAll(".gw-reveal");
        if (!panels?.length) return;
        gsap.fromTo(
          panels,
          { y: 12, opacity: 0.45, filter: "blur(3px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.48,
            stagger: 0.045,
            ease: "power3.out",
            clearProps: "transform,opacity,filter",
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [view], revertOnUpdate: true },
  );

  function updateGlass(patch: Partial<GlassSettings>) {
    const next = normalize({ ...material, ...patch });
    setMaterial(next);
    onGlassChange?.(next);
  }
  function closeSettings() {
    setSettingsOpen(false);
    settingsTrigger.current?.focus();
  }
  function changeView(next: View) {
    setView(next);
    setAlerts(false);
  }
  function toggleTheme() {
    const scheme = root.current
      ? getComputedStyle(root.current).colorScheme
      : "normal";
    const isDark =
      scheme === "dark" ||
      (scheme !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setLocalTheme(isDark ? "light" : "dark");
  }
  function exportReport() {
    const clean = (v: string) =>
      `"${(/^[\s]*[=+@-]/.test(v) ? "'" : "") + v.replace(/"/g, '""')}"`;
    const csv = [
      "Name,Category,Date,Amount,Status",
      ...visibleTransactions.map((t) =>
        [
          clean(t.name),
          clean(t.category),
          clean(t.date),
          t.amount,
          clean(t.status),
        ].join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Transactions exported.");
  }
  const nav = (compact = false) => (
    <nav
      className={compact ? "gw-rail gw-glass" : "gw-dock gw-glass"}
      aria-label={compact ? "Quick navigation" : "Workspace views"}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          type="button"
          aria-label={compact ? tab.label : undefined}
          title={compact ? tab.label : undefined}
          aria-current={view === tab.id ? "page" : undefined}
          onClick={() => changeView(tab.id)}
          onKeyDown={(e) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
              return;
            e.preventDefault();
            const next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? 3
                  : (i + (e.key === "ArrowRight" ? 1 : 3)) % 4;
            changeView(tabs[next].id);
            (
              e.currentTarget.parentElement?.children[next] as HTMLButtonElement
            )?.focus();
          }}
        >
          <tab.icon size={18} strokeWidth={1.7} aria-hidden="true" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
  const periodSelector = (label: string) =>
    cashFlowPeriods.length > 1 ? (
      <div className="gw-segment" role="group" aria-label={label}>
        {cashFlowPeriods.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selectedPeriod?.id === item.id}
            onClick={() => setPeriodId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    ) : null;
  const chart = points.length ? (
    <div className="gw-chart-wrap">
      <div className="gw-chart-labels">
        <span>{format(chartMaximum)}</span>
        <span>{format(chartMaximum / 2)}</span>
        <span>{format(0)}</span>
      </div>
      <svg
        viewBox="0 0 600 185"
        role="img"
        aria-label={`${selectedPeriod?.label ?? "Cash flow"}: money in ${format(income)}, money out ${format(expenses)}.`}
        preserveAspectRatio="none"
      >
        <desc>
          {points
            .map(
              (point) =>
                `${point.label}: income ${format(nonnegative(point.income))}, expenses ${format(nonnegative(point.expenses))}`,
            )
            .join(". ")}
        </desc>
        <defs>
          <linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--gw-accent)" stopOpacity=".23" />
            <stop offset="1" stopColor="var(--gw-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 100, 180].map((y) => (
          <path
            key={y}
            d={`M0 ${y} H600`}
            stroke="currentColor"
            opacity=".11"
            strokeDasharray="3 5"
          />
        ))}
        <path
          d={`M${chartX(0)} 185 ${points.map((point, index) => `L${chartX(index)} ${chartY(point.income)}`).join(" ")} L${chartX(points.length - 1)} 185 Z`}
          fill={`url(#${id}-area)`}
        />
        <polyline
          points={linePoints("income")}
          fill="none"
          stroke="var(--gw-accent)"
          strokeWidth="2.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={linePoints("expenses")}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".45"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.length === 1 && (
          <>
            <circle
              cx="300"
              cy={chartY(points[0].income)}
              r="4"
              fill="var(--gw-accent)"
            />
            <circle
              cx="300"
              cy={chartY(points[0].expenses)}
              r="4"
              fill="currentColor"
              opacity=".45"
            />
          </>
        )}
      </svg>
      <div className="gw-chart-months">
        {points.map(
          (point, index) =>
            chartLabelIndices.has(index) && (
              <span
                key={`${point.label}-${index}`}
                style={{
                  left: `${chartX(index) / 6}%`,
                  transform:
                    index === 0 && points.length > 1
                      ? "none"
                      : index === points.length - 1 && points.length > 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {point.label}
              </span>
            ),
        )}
      </div>
    </div>
  ) : (
    <div className="gw-empty gw-chart-empty">
      <ChartNoAxesCombined size={23} aria-hidden="true" />
      <h3>No cash-flow data yet</h3>
      <p>Cash flow will appear when period data is available.</p>
    </div>
  );
  const transactionList = (limit?: number) => (
    <div className="gw-transactions">
      {visibleTransactions.length ? (
        visibleTransactions.slice(0, limit).map((t) => (
          <div className="gw-transaction" key={t.id}>
            <span
              className={`gw-transaction-icon ${t.amount > 0 ? "is-income" : ""}`}
            >
              <IconFor category={t.category} />
            </span>
            <div className="gw-transaction-name">
              <strong>{t.name}</strong>
              <span>
                {t.category} · {t.date}
              </span>
            </div>
            <span
              className={`gw-transaction-status ${t.status === "Pending" ? "is-pending" : ""}`}
            >
              {t.status === "Completed" && (
                <Check size={12} aria-hidden="true" />
              )}
              {t.status}
            </span>
            <strong className={t.amount > 0 ? "gw-positive" : ""}>
              {t.amount > 0 ? "+" : "−"}
              {format(Math.abs(t.amount))}
            </strong>
          </div>
        ))
      ) : (
        <div className="gw-empty">
          <Search size={23} aria-hidden="true" />
          <h3>{filter ? "No matching transactions" : "No transactions yet"}</h3>
          <p>
            {filter
              ? "Try another name or category."
              : "Your activity will appear here."}
          </p>
          {filter && (
            <button type="button" onClick={() => setFilter("")}>
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
  const goalList = (
    <div className="gw-goals">
      {goals.length ? (
        goals.map((g, i) => (
          <div className="gw-goal" key={g.id}>
            <div className="gw-goal-top">
              <span className="gw-goal-icon">
                {i % 2 ? (
                  <Plane size={18} aria-hidden="true" />
                ) : (
                  <Target size={18} aria-hidden="true" />
                )}
              </span>
              <strong>{g.name}</strong>
              <span>{Math.round(goalProgress(g))}%</span>
            </div>
            <div
              className="gw-goal-track"
              role="progressbar"
              aria-label={g.name}
              aria-valuenow={Math.round(goalProgress(g))}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <i
                style={{
                  width: `${goalProgress(g)}%`,
                  background: g.color,
                }}
              />
            </div>
            <p>
              <strong>{format(g.saved)}</strong>
              <span>of {format(g.target)}</span>
            </p>
          </div>
        ))
      ) : (
        <p className="gw-empty">No savings goals yet.</p>
      )}
    </div>
  );

  return (
    <div
      ref={root}
      className={`gw-root ${className}`}
      data-theme={useHostTheme ? "system" : localTheme}
      data-host-theme={useHostTheme}
      style={
        {
          "--gw-blur": `${material.blur}px`,
          "--gw-opacity": material.opacity,
          "--gw-saturation": material.saturation,
          "--gw-tint": useHostTheme
            ? `color-mix(in srgb, var(--color-background, Canvas) 80%, ${material.tint})`
            : material.tint,
          "--gw-edge": material.edge,
          ...style,
        } as CSSProperties
      }
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          if (settingsOpen) closeSettings();
          setAlerts(false);
        }
      }}
    >
      <style>{styles}</style>
      {backgroundImage && !backgroundFailed && (
        <img
          className="gw-room"
          src={backgroundImage}
          alt=""
          onError={() => setBackgroundFailed(true)}
        />
      )}
      <div className="gw-room-shade" aria-hidden="true" />
      <div className="gw-workspace">
        <header className="gw-topbar gw-glass">
          <a
            className="gw-brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changeView("overview");
            }}
          >
            <span className="gw-brand-icon">
              <Layers size={18} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <strong>{brand}</strong>
            <span className="gw-brand-divider" />
            <span className="gw-personal">Personal workspace</span>
          </a>
          <div className="gw-toolbar">
            <button
              type="button"
              className="gw-adjust"
              ref={settingsTrigger}
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setAlerts(false);
              }}
              aria-expanded={settingsOpen}
              aria-controls={`${id}-material`}
            >
              <Settings2 size={16} aria-hidden="true" />
              <span>Adjust glass</span>
            </button>
            {!useHostTheme && (
              <button
                type="button"
                className="gw-icon-button"
                aria-label="Toggle light and dark theme"
                onClick={toggleTheme}
              >
                <Sun className="gw-sun" size={17} aria-hidden="true" />
                <Moon className="gw-moon" size={17} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="gw-icon-button gw-bell"
              aria-label="Notifications"
              aria-expanded={alerts}
              onClick={() => {
                setAlerts(!alerts);
                setSettingsOpen(false);
              }}
            >
              <Bell size={17} aria-hidden="true" />
              <i />
            </button>
            {userName && (
              <span className="gw-avatar" title={userName}>
                {userName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        </header>
        <div className="gw-stage">
          {nav(true)}
          <main className="gw-main gw-glass">
            <div className="gw-view-heading">
              <div>
                <p className="gw-greeting">
                  {view === "overview" && userName
                    ? `Welcome back, ${userName}.`
                    : "Your personal workspace"}
                </p>
                <h1>
                  {view === "overview"
                    ? "Overview"
                    : view === "activity"
                      ? "Activity"
                      : view === "savings"
                        ? "Savings & goals"
                        : "Reports"}
                </h1>
              </div>
              <div className="gw-heading-action">
                {view === "activity" || view === "reports" ? (
                  <button
                    type="button"
                    className="gw-button"
                    onClick={exportReport}
                  >
                    <Download size={14} aria-hidden="true" />
                    Export CSV
                  </button>
                ) : (
                  periodLabel && <span className="gw-date">{periodLabel}</span>
                )}
              </div>
            </div>
            <div className="gw-mobile-nav">{nav()}</div>
            <div ref={content} key={view} className="gw-view">
              {view === "overview" && (
                <>
                  <div className="gw-overview-grid">
                    <section className="gw-panel gw-balance gw-reveal">
                      <div className="gw-panel-title">
                        <span>Available balance</span>
                        <Wallet size={17} aria-hidden="true" />
                      </div>
                      <strong className="gw-balance-value">
                        {format(balance)}
                      </strong>
                      {balanceChange &&
                        Number.isFinite(balanceChange.percent) && (
                          <p className="gw-balance-meta">
                            <span
                              className={
                                balanceChange.percent >= 0
                                  ? "gw-positive"
                                  : undefined
                              }
                            >
                              {balanceChange.percent > 0 ? "+" : ""}
                              {balanceChange.percent}%
                            </span>{" "}
                            {balanceChange.label}
                          </p>
                        )}
                      {account && (
                        <div className="gw-account">
                          <span className="gw-account-icon">
                            <CreditCard size={19} aria-hidden="true" />
                          </span>
                          <div>
                            <strong>{account.name}</strong>
                            {account.lastFour && (
                              <span>•••• {account.lastFour.slice(-4)}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            aria-label="View account activity"
                            onClick={() => changeView("activity")}
                          >
                            <ArrowUpRight size={20} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </section>
                    <section className="gw-panel gw-cashflow gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Cash flow</h2>
                        {periodSelector("Chart period")}
                      </div>
                      <div className="gw-chart-summary">
                        <div>
                          <span>
                            <i />
                            Money in
                          </span>
                          <strong>{format(income)}</strong>
                        </div>
                        <div>
                          <span>
                            <i />
                            Money out
                          </span>
                          <strong>{format(expenses)}</strong>
                        </div>
                      </div>
                      {chart}
                    </section>
                  </div>
                  <div className="gw-lower-grid">
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Recent activity</h2>
                        <button
                          className="gw-text-button"
                          type="button"
                          onClick={() => changeView("activity")}
                        >
                          View all
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      </div>
                      {transactionList(4)}
                    </section>
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Savings goals</h2>
                        <span className="gw-small-label">
                          {goals.length} active
                        </span>
                      </div>
                      {goalList}
                    </section>
                  </div>
                </>
              )}
              {view === "activity" && (
                <section className="gw-panel gw-reveal">
                  <div className="gw-panel-title">
                    <h2>
                      Transactions{" "}
                      <span className="gw-count">{transactions.length}</span>
                    </h2>
                    <label className="gw-search">
                      <Search size={15} aria-hidden="true" />
                      <input
                        aria-label="Search transactions"
                        placeholder="Search transactions"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      />
                      {filter && (
                        <button
                          type="button"
                          aria-label="Clear search"
                          onClick={() => setFilter("")}
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      )}
                    </label>
                  </div>
                  {transactionList()}
                </section>
              )}
              {view === "savings" && (
                <>
                  <div className="gw-savings-intro gw-reveal">
                    <span className="gw-savings-orb">
                      <Target size={28} strokeWidth={1.3} aria-hidden="true" />
                    </span>
                    <div>
                      <p>Total saved</p>
                      <strong>{format(totalSaved)}</strong>
                    </div>
                    <span>
                      {goals.length} savings goals
                      <br />
                      Tracked in one place
                    </span>
                  </div>
                  <section className="gw-panel gw-reveal">
                    <div className="gw-panel-title">
                      <h2>Your goals</h2>
                      <span>{goals.length} active</span>
                    </div>
                    {goalList}
                  </section>
                  {savingsNote && (
                    <section className="gw-savings-note gw-reveal">
                      <Check size={18} aria-hidden="true" />
                      <p>{savingsNote}</p>
                    </section>
                  )}
                </>
              )}
              {view === "reports" && (
                <>
                  <div className="gw-report-stats gw-reveal">
                    {[
                      {
                        label: "Money in",
                        value: income,
                        icon: ArrowDownLeft,
                      },
                      {
                        label: "Money out",
                        value: expenses,
                        icon: ArrowUpRight,
                      },
                      {
                        label: "Net cash flow",
                        value: income - expenses,
                        icon: ChartNoAxesCombined,
                      },
                    ].map((s) => (
                      <section className="gw-panel" key={s.label}>
                        <div className="gw-panel-title">
                          <span>{s.label}</span>
                          <s.icon size={17} aria-hidden="true" />
                        </div>
                        <strong>{format(s.value)}</strong>
                        <span>{selectedPeriod?.label ?? "No period data"}</span>
                      </section>
                    ))}
                  </div>
                  <div className="gw-reports-grid">
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Income & expenses</h2>
                        {periodSelector("Report period")}
                      </div>
                      <div className="gw-chart-legend">
                        <span>
                          <i />
                          Money in
                        </span>
                        <span>
                          <i />
                          Money out
                        </span>
                      </div>
                      {chart}
                      {selectedPeriod?.description && (
                        <p className="gw-chart-footnote">
                          {selectedPeriod.description}
                        </p>
                      )}
                    </section>
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Where it goes</h2>
                        <span>All supplied activity</span>
                      </div>
                      <div className="gw-category-list">
                        {spendingCategories.map((category, i) => {
                          const value = transactions
                            .filter(
                              (t) => t.category === category && t.amount < 0,
                            )
                            .reduce((s, t) => s - t.amount, 0);
                          return (
                            <div key={category}>
                              <div>
                                <IconFor category={category} />
                                <span>{category}</span>
                                <strong>{format(value)}</strong>
                              </div>
                              <span className="gw-category-track">
                                <i
                                  style={{
                                    width: `${spent ? (value / spent) * 100 : 0}%`,
                                    opacity: Math.max(0.4, 1 - i * 0.14),
                                  }}
                                />
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                </>
              )}
            </div>
            {footerNote && (
              <footer className="gw-footer">
                <span>
                  <i />
                  {footerNote}
                </span>
              </footer>
            )}
            <div className="gw-desktop-dock">{nav()}</div>
          </main>
        </div>
        {alerts && (
          <aside
            className="gw-notifications gw-glass"
            aria-label="Notifications"
          >
            <div>
              <h2>You're all caught up.</h2>
              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setAlerts(false)}
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <p>No new notifications.</p>
          </aside>
        )}
        {settingsOpen && (
          <aside
            className="gw-material gw-glass"
            id={`${id}-material`}
            aria-label="Glass appearance"
          >
            <div className="gw-material-title">
              <div>
                <span className="gw-material-icon">
                  <Settings2 size={18} aria-hidden="true" />
                </span>
                <h2>Glass appearance</h2>
              </div>
              <button
                type="button"
                className="gw-icon-button"
                aria-label="Close glass settings"
                onClick={closeSettings}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p>Adjust the material across your workspace.</p>
            <div className="gw-material-sample" aria-hidden="true">
              <Layers size={28} strokeWidth={1.1} />
              <span>Live material preview</span>
            </div>
            <div className="gw-presets" aria-label="Glass presets">
              {[
                {
                  name: "Clear",
                  value: { blur: 8, opacity: 0.12, saturation: 1.1, edge: 0.8 },
                },
                { name: "Frosted", value: defaults },
                {
                  name: "Solid",
                  value: { blur: 32, opacity: 0.86, saturation: 1, edge: 0.35 },
                },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => updateGlass(p.value)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            {[
              {
                key: "blur",
                label: "Blur",
                min: 0,
                max: 40,
                step: 1,
                value: `${Math.round(material.blur)} px`,
              },
              {
                key: "opacity",
                label: "Opacity",
                min: 0.08,
                max: 0.9,
                step: 0.01,
                value: `${Math.round(material.opacity * 100)}%`,
              },
              {
                key: "saturation",
                label: "Saturation",
                min: 0.5,
                max: 2,
                step: 0.05,
                value: `${Math.round(material.saturation * 100)}%`,
              },
              {
                key: "edge",
                label: "Edge light",
                min: 0,
                max: 1,
                step: 0.05,
                value: `${Math.round(material.edge * 100)}%`,
              },
            ].map((c) => (
              <label className="gw-range" key={c.key}>
                <span>
                  {c.label}
                  <output>{c.value}</output>
                </span>
                <input
                  type="range"
                  aria-label={c.label}
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={material[c.key as keyof GlassSettings]}
                  onChange={(e) =>
                    updateGlass({ [c.key]: Number(e.target.value) })
                  }
                />
              </label>
            ))}
            <label className="gw-tint">
              Glass tint{" "}
              <input
                type="color"
                value={material.tint}
                onChange={(e) => updateGlass({ tint: e.target.value })}
              />
            </label>
            <button
              className="gw-reset"
              type="button"
              onClick={() => updateGlass(normalize(glass))}
            >
              Reset appearance
            </button>
          </aside>
        )}
      </div>
      {notice && (
        <div className="gw-toast" role="status">
          <Check size={16} aria-hidden="true" />
          {notice}
        </div>
      )}
    </div>
  );
}

const styles = `
.gw-root {
  --gw-ink: var(--color-foreground, CanvasText);
  --gw-muted: var(--color-muted-foreground, GrayText);
  --gw-accent: var(--color-primary, Highlight);
  --gw-line: color-mix(
    in srgb,
    var(--color-border, CanvasText) 35%,
    transparent
  );
  --gw-background: var(--color-background, Canvas);
  --gw-shade: color-mix(
    in srgb,
    var(--color-background, Canvas) 22%,
    transparent
  );
  --gw-surface: var(--color-card, var(--color-background, Canvas));
  --gw-panel: var(--color-card, var(--color-background, Canvas));
  --gw-brand: var(--color-primary, Highlight);
  --gw-brand-ink: var(--color-primary-foreground, HighlightText);
  --gw-avatar: var(--color-secondary, ButtonFace);
  --gw-rail-active: color-mix(
    in srgb,
    var(--color-secondary, ButtonFace) 70%,
    transparent
  );
  --gw-positive-surface: color-mix(
    in srgb,
    var(--color-primary, Highlight) 15%,
    var(--color-card, Canvas)
  );
  --gw-account-surface: color-mix(
    in srgb,
    var(--color-secondary, ButtonFace) 45%,
    transparent
  );
  --gw-account-action: color-mix(
    in srgb,
    var(--color-secondary, ButtonFace) 45%,
    transparent
  );
  --gw-segment: color-mix(
    in srgb,
    var(--color-muted, ButtonFace) 25%,
    transparent
  );
  --gw-segment-active: color-mix(
    in srgb,
    var(--color-card, Canvas) 85%,
    transparent
  );
  --gw-transaction-surface: color-mix(
    in srgb,
    var(--color-secondary, ButtonFace) 45%,
    transparent
  );
  --gw-income-surface: color-mix(
    in srgb,
    var(--color-primary, Highlight) 15%,
    transparent
  );
  --gw-pending: var(--color-muted-foreground, GrayText);
  --gw-goal-surface: color-mix(
    in srgb,
    var(--color-secondary, ButtonFace) 40%,
    transparent
  );
  --gw-dock: color-mix(in srgb, var(--color-card, Canvas) 70%, transparent);
  --gw-dock-active: var(--color-secondary, ButtonFace);
  --gw-button: var(--color-primary, Highlight);
  --gw-button-ink: var(--color-primary-foreground, HighlightText);
  --gw-search: color-mix(in srgb, var(--color-input, Canvas) 35%, transparent);
  --gw-savings-orb: color-mix(
    in srgb,
    var(--color-primary, Highlight) 15%,
    transparent
  );
  --gw-popover: color-mix(
    in srgb,
    var(--color-popover, Canvas) 94%,
    transparent
  );
  --gw-notification: color-mix(
    in srgb,
    var(--color-popover, Canvas) 94%,
    transparent
  );
  --gw-fallback: var(--color-card, Canvas);
  --gw-mobile-dock: color-mix(
    in srgb,
    var(--color-card, Canvas) 55%,
    transparent
  );
  --gw-shadow: color-mix(
    in srgb,
    var(--color-foreground, CanvasText) 18%,
    transparent
  );
  --gw-panel-shadow: color-mix(
    in srgb,
    var(--color-foreground, CanvasText) 16%,
    transparent
  );
  --gw-soft-shadow: color-mix(
    in srgb,
    var(--color-foreground, CanvasText) 7%,
    transparent
  );
  --gw-segment-shadow: color-mix(
    in srgb,
    var(--color-foreground, CanvasText) 6%,
    transparent
  );
  --gw-dock-shadow: color-mix(
    in srgb,
    var(--color-foreground, CanvasText) 7%,
    transparent
  );
  --gw-popover-shadow: color-mix(
    in srgb,
    var(--color-foreground, CanvasText) 20%,
    transparent
  );
  --gw-sample-shadow: color-mix(
    in srgb,
    var(--color-foreground, CanvasText) 35%,
    transparent
  );
  --gw-toast-shadow: color-mix(
    in srgb,
    var(--color-foreground, CanvasText) 13%,
    transparent
  );
  --gw-toast: var(--color-primary, Highlight);
  --gw-dock-ink: var(--color-secondary-foreground, CanvasText);
  --gw-selection: color-mix(
    in srgb,
    var(--color-primary, Highlight) 35%,
    transparent
  );
  --gw-scrollbar: var(--color-muted-foreground, GrayText);
  --gw-hover: color-mix(
    in srgb,
    var(--color-secondary, ButtonFace) 25%,
    transparent
  );
  --gw-dock-hover: color-mix(
    in srgb,
    var(--color-secondary, ButtonFace) 30%,
    transparent
  );
  --gw-control-hover: color-mix(
    in srgb,
    var(--color-secondary, ButtonFace) 35%,
    transparent
  );
  --gw-strong-edge: color-mix(
    in srgb,
    var(--color-card, Canvas) 60%,
    transparent
  );
  --gw-soft-edge: color-mix(
    in srgb,
    var(--color-card, Canvas) 53%,
    transparent
  );
  --gw-toast-ink: var(--color-primary-foreground, HighlightText);
  --gw-highlight: var(--color-card, Canvas);
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
  padding: 38px 28px 32px;
  background: var(--gw-background);
  color: var(--gw-ink);
  font:
    14px/1.5 "Segoe UI",
    Arial,
    sans-serif;
  letter-spacing: -0.012em;
  font-variant-numeric: tabular-nums;
  box-sizing: border-box;
  color-scheme: inherit;
}
.gw-root[data-theme="light"] {
  color-scheme: light;
}
.gw-root[data-theme="dark"] {
  color-scheme: dark;
}
.gw-root * {
  box-sizing: border-box;
}
.gw-root ::selection {
  background: var(--gw-selection);
}
.gw-root button,
.gw-root input,
.gw-root a {
  font: inherit;
  color: inherit;
}
.gw-root button {
  cursor: pointer;
}
.gw-root button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.gw-root button,
.gw-root a,
.gw-root input {
  outline-offset: 4px;
}
.gw-root :focus-visible {
  outline: 2px solid var(--gw-accent);
}
.gw-root button {
  border: 0;
  background: none;
}
.gw-root h1,
.gw-root h2,
.gw-root h3,
.gw-root p {
  margin: 0;
}
.gw-room {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 56%;
  z-index: -3;
}
.gw-room-shade {
  position: absolute;
  inset: 0;
  background: var(--gw-shade);
  z-index: -2;
}
.gw-workspace {
  position: relative;
  width: min(1280px, 100%);
  margin: auto;
}
.gw-glass {
  background: color-mix(
    in srgb,
    var(--gw-surface) calc(var(--gw-opacity) * 100%),
    transparent
  );
  backdrop-filter: blur(var(--gw-blur)) saturate(var(--gw-saturation));
  -webkit-backdrop-filter: blur(var(--gw-blur)) saturate(var(--gw-saturation));
  box-shadow:
    inset 0 1px 0
      color-mix(
        in srgb,
        var(--gw-highlight) calc(var(--gw-edge) * 100%),
        transparent
      ),
    inset 0 0 0 1px
      color-mix(
        in srgb,
        var(--gw-highlight) calc(var(--gw-edge) * 34%),
        transparent
      ),
    0 20px 52px -25px var(--gw-shadow);
  position: relative;
}
.gw-glass:before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--gw-tint);
  opacity: 0.12;
  pointer-events: none;
  border-radius: inherit;
}
.gw-topbar {
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-radius: 20px;
  margin-bottom: 18px;
  padding: 0 20px;
}
.gw-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  white-space: nowrap;
}
.gw-brand strong {
  font-size: 14px;
  letter-spacing: -0.025em;
}
.gw-brand-icon {
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  background: var(--gw-brand);
  color: var(--gw-brand-ink);
  border-radius: 9px;
}
.gw-brand-divider {
  height: 16px;
  width: 1px;
  background: var(--gw-line);
  margin: 0 4px;
}
.gw-personal {
  font-size: 12px;
  color: var(--gw-muted);
}
.gw-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.gw-adjust {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 9px;
  padding: 8px 10px;
}
.gw-adjust:hover {
  background: var(--gw-hover);
}
.gw-icon-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  flex: none;
}
.gw-icon-button:hover {
  background: var(--gw-hover);
}
.gw-bell {
  position: relative;
}
.gw-bell i {
  position: absolute;
  right: 8px;
  top: 6px;
  background: var(--gw-accent);
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
.gw-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--gw-avatar);
  display: grid;
  place-items: center;
  font:
    600 12px Georgia,
    serif;
}
.gw-stage {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.gw-rail {
  border-radius: 23px;
  width: 50px;
  padding: 8px 5px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 50px;
  flex: none;
}
.gw-rail button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.gw-rail button span {
  display: none;
}
.gw-rail button[aria-current] {
  background: var(--gw-rail-active);
  box-shadow: 0 3px 8px var(--gw-soft-shadow);
}
.gw-main {
  border-radius: 27px;
  padding: 30px 30px 98px;
  flex: 1;
  min-width: 0;
}
.gw-view-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.gw-greeting {
  font-size: 13px;
  color: var(--gw-muted);
  margin-bottom: 5px !important;
}
.gw-view-heading h1 {
  font-size: clamp(23px, 2.3vw, 31px);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1.18;
}
.gw-date {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--gw-muted);
  white-space: nowrap;
}
.gw-panel {
  background: color-mix(
    in srgb,
    var(--gw-panel) calc((0.16 + var(--gw-opacity) * 0.5) * 100%),
    transparent
  );
  border-radius: 17px;
  box-shadow:
    inset 0 1px 0
      color-mix(
        in srgb,
        var(--gw-highlight) calc(var(--gw-edge) * 75%),
        transparent
      ),
    0 8px 22px -20px var(--gw-panel-shadow);
  padding: 21px;
  min-width: 0;
  position: relative;
}
.gw-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  color: var(--gw-muted);
  font-size: 12px;
}
.gw-panel-title h2 {
  font-size: 14px;
  letter-spacing: -0.02em;
  font-weight: 600;
  color: var(--gw-ink);
}
.gw-panel-title > svg {
  opacity: 0.65;
}
.gw-overview-grid {
  display: grid;
  grid-template-columns: 0.82fr 1.5fr;
  gap: 16px;
  margin-bottom: 16px;
}
.gw-balance {
  display: flex;
  flex-direction: column;
}
.gw-balance-value {
  font-size: clamp(29px, 3.15vw, 43px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.25;
  white-space: nowrap;
}
.gw-balance-meta {
  font-size: 11px;
  color: var(--gw-muted);
  margin-top: 10px !important;
}
.gw-positive {
  color: var(--gw-accent);
}
.gw-balance-meta .gw-positive {
  background: var(--gw-positive-surface);
  border-radius: 5px;
  padding: 3px 5px;
  margin-right: 5px;
}
.gw-account {
  margin-top: auto;
  padding-top: 35px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.gw-account-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--gw-account-surface);
}
.gw-account > div {
  display: flex;
  flex-direction: column;
}
.gw-account strong {
  font-weight: 500;
  font-size: 12px;
}
.gw-account span {
  font-size: 11px;
  color: var(--gw-muted);
}
.gw-account > button {
  margin-left: auto;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gw-account-action);
  display: grid;
  place-items: center;
}
.gw-segment {
  display: flex;
  gap: 3px;
  background: var(--gw-segment);
  border-radius: 8px;
  padding: 3px;
  font-size: 10px;
}
.gw-segment button {
  padding: 4px 8px;
  border-radius: 6px;
}
.gw-segment button[aria-pressed="true"] {
  background: var(--gw-segment-active);
  box-shadow: 0 2px 4px var(--gw-segment-shadow);
  color: var(--gw-ink);
}
.gw-chart-summary {
  display: flex;
  gap: 34px;
  margin-bottom: 18px;
}
.gw-chart-legend {
  display: flex;
  gap: 20px;
  margin: -4px 0 14px;
  font-size: 11px;
  color: var(--gw-muted);
}
.gw-chart-legend span {
  display: flex;
  gap: 6px;
  align-items: center;
}
.gw-chart-legend i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gw-accent);
}
.gw-chart-legend span + span i {
  background: var(--gw-muted);
}
.gw-chart-summary > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.gw-chart-summary span {
  font-size: 10px;
  color: var(--gw-muted);
  display: flex;
  align-items: center;
  gap: 5px;
}
.gw-chart-summary i {
  width: 5px;
  height: 5px;
  background: var(--gw-accent);
  border-radius: 50%;
}
.gw-chart-summary > div + div i {
  background: var(--gw-muted);
}
.gw-chart-summary strong {
  font-size: 21px;
  font-weight: 500;
  letter-spacing: -0.03em;
}
.gw-chart-wrap {
  position: relative;
  padding-left: 39px;
  padding-top: 2px;
}
.gw-chart-wrap svg {
  display: block;
  width: 100%;
  height: 126px;
  overflow: visible;
}
.gw-chart-labels {
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 8px;
  color: var(--gw-muted);
}
.gw-chart-months {
  position: relative;
  height: 24px;
  font-size: 9px;
  color: var(--gw-muted);
  padding-top: 10px;
}
.gw-lower-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}
.gw-text-button {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px !important;
}
.gw-text-button:hover {
  color: var(--gw-accent);
}
.gw-transaction {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 0;
  border-top: 1px solid var(--gw-line);
  min-width: 0;
}
.gw-transaction:first-child {
  border-top: 0;
  padding-top: 0;
}
.gw-transaction:last-child {
  padding-bottom: 0;
}
.gw-transaction-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--gw-transaction-surface);
  flex: none;
}
.gw-transaction-icon.is-income {
  background: var(--gw-income-surface);
  color: var(--gw-accent);
}
.gw-transaction-name {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.gw-transaction-name strong {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.gw-transaction-name span {
  font-size: 10px;
  color: var(--gw-muted);
  margin-top: 2px;
}
.gw-transaction > strong {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.gw-transaction-status {
  font-size: 9px;
  color: var(--gw-muted);
  display: flex;
  align-items: center;
  gap: 3px;
}
.gw-transaction-status.is-pending {
  color: var(--gw-pending);
}
.gw-small-label {
  font-size: 10px;
}
.gw-goal + .gw-goal {
  margin-top: 22px;
}
.gw-goal-top {
  display: flex;
  align-items: center;
  gap: 9px;
}
.gw-goal-top strong {
  font-size: 12px;
  font-weight: 500;
  flex: 1;
}
.gw-goal-top > span:last-child {
  font-size: 10px;
  color: var(--gw-muted);
}
.gw-goal-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--gw-goal-surface);
  display: grid;
  place-items: center;
}
.gw-goal-track {
  height: 5px;
  background: var(--gw-line);
  margin: 11px 0 6px;
  border-radius: 5px;
  overflow: hidden;
}
.gw-goal-track i {
  height: 100%;
  display: block;
  background: var(--gw-accent);
  border-radius: 5px;
}
.gw-goal p {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--gw-muted);
}
.gw-goal p strong {
  font-weight: 500;
  color: var(--gw-ink);
}
.gw-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--gw-muted);
  font-size: 9px;
  margin-top: 22px;
  gap: 16px;
}
.gw-footer > span:first-child {
  display: flex;
  align-items: center;
  gap: 6px;
}
.gw-footer i {
  height: 4px;
  width: 4px;
  background: var(--gw-accent);
  border-radius: 50%;
}
.gw-desktop-dock {
  position: absolute;
  bottom: 19px;
  left: 50%;
  transform: translateX(-50%);
}
.gw-dock {
  display: flex;
  align-items: center;
  gap: 3px;
  border-radius: 30px;
  padding: 5px;
  white-space: nowrap;
  background: var(--gw-dock);
  backdrop-filter: blur(20px);
}
.gw-dock button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 24px;
  padding: 10px 17px;
  font-size: 11px;
  transition:
    background 0.22s,
    color 0.22s;
}
.gw-dock button svg {
  width: 15px;
}
.gw-dock button[aria-current] {
  background: var(--gw-dock-active);
  color: var(--gw-dock-ink);
  box-shadow: 0 3px 7px var(--gw-dock-shadow);
}
.gw-dock button:not([aria-current]):hover {
  background: var(--gw-dock-hover);
}
.gw-mobile-nav {
  display: none;
}
.gw-button {
  padding: 9px 13px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--gw-button) !important;
  color: var(--gw-button-ink) !important;
  font-size: 11px !important;
  white-space: nowrap;
}
.gw-button:hover {
  filter: brightness(1.13);
}
.gw-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--gw-search);
  border: 1px solid var(--gw-line);
  border-radius: 8px;
  padding: 7px 10px;
}
.gw-search input {
  width: 165px;
  background: none;
  border: 0;
  caret-color: var(--gw-accent);
  font-size: 11px;
}
.gw-search input::placeholder {
  color: var(--gw-muted);
}
.gw-search button {
  padding: 0;
  display: flex;
}
.gw-count {
  margin-left: 6px;
  font-size: 10px;
  color: var(--gw-muted);
}
.gw-empty {
  text-align: center;
  padding: 70px 15px;
  color: var(--gw-muted);
  font-size: 12px;
}
.gw-empty svg {
  margin-bottom: 12px;
}
.gw-empty h3 {
  font-size: 15px;
  color: var(--gw-ink);
  margin-bottom: 6px;
}
.gw-empty button {
  margin-top: 15px;
  text-decoration: underline;
}
.gw-savings-intro {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 10px 35px;
}
.gw-savings-orb {
  width: 65px;
  height: 65px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--gw-savings-orb);
  box-shadow: inset 0 1px 0 var(--gw-strong-edge);
}
.gw-savings-intro p {
  font-size: 12px;
  color: var(--gw-muted);
}
.gw-savings-intro strong {
  font-size: 40px;
  letter-spacing: -0.04em;
  font-weight: 500;
}
.gw-savings-intro > span:last-child {
  margin-left: auto;
  font-size: 13px;
  color: var(--gw-muted);
}
.gw-view:has(.gw-savings-intro) .gw-goals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 34px;
}
.gw-view:has(.gw-savings-intro) .gw-goal + .gw-goal {
  margin-top: 0;
}
.gw-savings-note {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--gw-muted);
  font-size: 12px;
  padding: 24px 4px;
}
.gw-report-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.gw-report-stats strong {
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.035em;
  display: block;
}
.gw-report-stats section > span {
  font-size: 10px;
  color: var(--gw-muted);
}
.gw-report-stats .gw-panel-title {
  margin-bottom: 15px;
}
.gw-reports-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
}
.gw-reports-grid .gw-chart-wrap svg {
  height: 185px;
}
.gw-chart-footnote {
  font-size: 9px;
  color: var(--gw-muted);
  margin-top: 15px !important;
}
.gw-category-list > div + div {
  margin-top: 19px;
}
.gw-category-list > div > div {
  display: flex;
  gap: 7px;
  align-items: center;
  font-size: 11px;
}
.gw-category-list strong {
  margin-left: auto;
  font-weight: 500;
}
.gw-category-list svg {
  width: 14px;
}
.gw-category-track {
  display: block;
  height: 4px;
  border-radius: 3px;
  background: var(--gw-line);
  margin-top: 9px;
}
.gw-category-track i {
  display: block;
  height: 100%;
  background: var(--gw-accent);
  border-radius: 3px;
}
.gw-material {
  position: absolute;
  z-index: 20;
  max-height: calc(100svh - 128px);
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--gw-scrollbar) transparent;
  right: 10px;
  top: 75px;
  width: 300px;
  border-radius: 22px;
  padding: 22px;
  background: var(--gw-popover);
  box-shadow:
    inset 0 1px 0 var(--gw-soft-edge),
    0 24px 80px var(--gw-popover-shadow);
}
.gw-material-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.gw-material-title > div {
  display: flex;
  gap: 10px;
  align-items: center;
}
.gw-material h2 {
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.03em;
}
.gw-material-icon {
  display: grid;
  place-items: center;
}
.gw-material > p {
  font-size: 11px;
  color: var(--gw-muted);
  margin: 7px 0 18px;
}
.gw-material-sample {
  height: 87px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 13px;
  margin-bottom: 17px;
  background: color-mix(
    in srgb,
    var(--gw-tint) calc(var(--gw-opacity) * 100%),
    transparent
  );
  backdrop-filter: blur(var(--gw-blur));
  box-shadow:
    inset 0 1px 0
      color-mix(
        in srgb,
        var(--gw-highlight) calc(var(--gw-edge) * 100%),
        transparent
      ),
    0 12px 20px -18px var(--gw-sample-shadow);
  font-size: 12px;
}
.gw-presets {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
}
.gw-presets button {
  flex: 1;
  border: 1px solid var(--gw-line);
  border-radius: 7px;
  padding: 6px 0;
  font-size: 11px;
}
.gw-presets button:hover {
  background: var(--gw-control-hover);
}
.gw-range {
  display: block;
  margin: 17px 0;
}
.gw-range > span {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}
.gw-range output {
  font-size: 10px;
  color: var(--gw-muted);
}
.gw-range input {
  width: 100%;
  accent-color: var(--gw-accent);
  height: 16px;
  margin: 8px 0 0;
  cursor: pointer;
}
.gw-tint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  margin-top: 20px;
}
.gw-tint input {
  height: 28px;
  width: 42px;
  padding: 2px;
  background: none;
  border: 1px solid var(--gw-line);
  border-radius: 6px;
  cursor: pointer;
}
.gw-reset {
  width: 100%;
  border: 1px solid var(--gw-line) !important;
  border-radius: 8px;
  padding: 8px;
  margin-top: 22px;
  font-size: 11px !important;
}
.gw-reset:hover {
  background: var(--gw-control-hover);
}
.gw-notifications {
  position: absolute;
  right: 25px;
  top: 75px;
  z-index: 21;
  width: 280px;
  border-radius: 16px;
  padding: 22px;
  background: var(--gw-notification);
}
.gw-notifications > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.gw-notifications h2 {
  font-size: 15px;
  font-weight: 500;
}
.gw-notifications p {
  margin-top: 8px;
  font-size: 12px;
  color: var(--gw-muted);
}
.gw-toast {
  position: fixed;
  left: 50%;
  bottom: 25px;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-radius: 12px;
  background: var(--gw-toast);
  color: var(--gw-toast-ink);
  box-shadow: 0 10px 30px var(--gw-toast-shadow);
  font-size: 12px;
  white-space: nowrap;
}
.gw-sun {
  display: none;
}
[data-theme="dark"] .gw-sun {
  display: block;
}
[data-theme="dark"] .gw-moon {
  display: none;
}
.gw-chart-months > span {
  position: absolute;
  white-space: nowrap;
}
.gw-chart-empty {
  padding: 35px 15px;
  min-height: 160px;
}
@supports not (backdrop-filter: blur(1px)) {
  .gw-glass,
  .gw-panel {
    background: var(--gw-fallback);
  }
}
@media (min-width: 1550px) {
  .gw-root {
    padding-top: 65px;
  }
  .gw-main {
    padding-top: 36px;
  }
  .gw-chart-wrap svg {
    height: 150px;
  }
  .gw-panel {
    padding: 25px;
  }
  .gw-transaction {
    padding: 14px 0;
  }
}
@media (max-width: 1050px) {
  .gw-root {
    padding: 24px 18px;
  }
  .gw-main {
    padding: 25px 23px 92px;
  }
  .gw-rail {
    display: none;
  }
  .gw-balance-value {
    font-size: 32px;
  }
  .gw-transaction-status {
    display: none;
  }
  .gw-personal,
  .gw-brand-divider {
    display: none;
  }
  .gw-panel {
    padding: 18px;
  }
  .gw-chart-summary {
    gap: 20px;
  }
  .gw-chart-summary strong {
    font-size: 19px;
  }
}
@media (max-width: 700px) {
  .gw-root {
    padding: 12px 10px 24px;
  }
  .gw-topbar {
    height: 56px;
    padding: 0 12px;
    border-radius: 17px;
    margin-bottom: 12px;
  }
  .gw-toolbar {
    gap: 3px;
  }
  .gw-brand {
    gap: 7px;
  }
  .gw-brand strong {
    font-size: 12px;
  }
  .gw-brand-icon {
    width: 25px;
    height: 25px;
  }
  .gw-bell,
  .gw-avatar {
    display: none !important;
  }
  .gw-adjust {
    padding: 8px;
    font-size: 11px !important;
    gap: 5px;
  }
  .gw-main {
    border-radius: 20px;
    padding: 23px 15px;
  }
  .gw-view-heading {
    gap: 8px;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .gw-view-heading h1 {
    font-size: 25px;
    max-width: 290px;
    line-height: 1.12;
  }
  .gw-greeting {
    font-size: 11px;
  }
  .gw-heading-action .gw-date {
    display: none;
  }
  .gw-heading-action .gw-button {
    padding: 8px 10px;
    font-size: 10px !important;
  }
  .gw-mobile-nav {
    display: block;
    margin-bottom: 20px;
  }
  .gw-mobile-nav .gw-dock {
    width: 100%;
    padding: 4px;
    border-radius: 12px;
    justify-content: space-between;
    background: var(--gw-mobile-dock);
    box-shadow: none;
  }
  .gw-dock button {
    font-size: 10px;
    padding: 9px 10px;
    border-radius: 9px;
    gap: 5px;
  }
  .gw-dock button svg {
    width: 13px;
    height: 13px;
  }
  .gw-desktop-dock {
    display: none;
  }
  .gw-overview-grid,
  .gw-lower-grid,
  .gw-reports-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .gw-overview-grid {
    margin-bottom: 12px;
  }
  .gw-balance {
    min-height: 221px;
  }
  .gw-balance-value {
    font-size: 39px;
  }
  .gw-balance-meta {
    font-size: 11px;
  }
  .gw-account {
    padding-top: 23px;
  }
  .gw-panel {
    border-radius: 15px;
    padding: 18px;
  }
  .gw-chart-wrap svg {
    height: 130px;
  }
  .gw-chart-summary strong {
    font-size: 22px;
  }
  .gw-chart-summary {
    gap: 35px;
  }
  .gw-panel-title {
    gap: 8px;
    margin-bottom: 18px;
  }
  .gw-footer {
    font-size: 8px;
    margin-top: 24px;
  }
  .gw-footer > span:last-child {
    display: none;
  }
  .gw-material {
    right: 4px;
    top: 65px;
    width: min(310px, calc(100% - 8px));
    padding: 20px;
    max-height: calc(100svh - 90px);
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--gw-scrollbar) transparent;
  }
  .gw-notifications {
    right: 4px;
    max-width: calc(100% - 8px);
  }
  .gw-transaction-name strong,
  .gw-transaction > strong {
    font-size: 11px;
  }
  .gw-search {
    padding: 7px;
    width: 100%;
  }
  .gw-search input {
    width: 100%;
    min-width: 0;
  }
  .gw-view:has(.gw-search) .gw-panel-title {
    flex-wrap: wrap;
  }
  .gw-report-stats {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
  .gw-report-stats .gw-panel {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
  }
  .gw-report-stats .gw-panel-title {
    margin: 0;
  }
  .gw-report-stats .gw-panel-title svg {
    display: none;
  }
  .gw-report-stats strong {
    font-size: 26px;
  }
  .gw-report-stats section > span {
    grid-column: 1/-1;
    margin-top: 8px;
  }
  .gw-savings-intro {
    gap: 12px;
    padding: 10px 2px 26px;
    flex-wrap: wrap;
  }
  .gw-savings-intro strong {
    font-size: 34px;
  }
  .gw-savings-intro > span:last-child {
    display: none;
  }
  .gw-savings-orb {
    width: 52px;
    height: 52px;
  }
  .gw-view:has(.gw-savings-intro) .gw-goals {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  .gw-view:has(.gw-search) {
    min-height: 370px;
  }
  .gw-toast {
    max-width: calc(100% - 30px);
    font-size: 11px;
    white-space: normal;
  }
  .gw-chart-months {
    font-size: 8px;
  }
}
@media (max-height: 550px) {
  .gw-material {
    top: 70px;
    max-height: calc(100svh - 110px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .gw-root * {
    scroll-behavior: auto !important;
    transition: none !important;
  }
}
`;
