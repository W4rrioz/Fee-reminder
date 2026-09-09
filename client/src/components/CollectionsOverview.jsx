import React, { useMemo } from 'react';

/**
 * Format currency amounts in compact format (e.g. ₹42k, ₹1.5L, ₹800)
 */
function formatCompactCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${l.toFixed(l % 1 === 0 ? 0 : 1)}L`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k.toFixed(k % 1 === 0 ? 0 : 1)}k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Component: CollectionsOverview
 * Follows Stitch design:
 * 1. Status Donut Chart: Paid (#15803D), Pending (#3730A3), Overdue (#DC2626)
 * 2. Monthly Amount Donut Chart: Collected (#15803D) vs Outstanding (#DC2626) + Collection Rate %
 * 3. 3 Summary metrics: Total Outstanding (₹), Collection Rate (%), Overdue Students count
 */
export default function CollectionsOverview({ students = [], summary = null }) {
  const metrics = useMemo(() => {
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;
    let totalDueAmount = 0;
    let totalCollectedAmount = 0;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    let monthCollected = 0;
    let monthOutstanding = 0;
    let hasMonthData = false;

    students.forEach((student) => {
      const fee = student.fee;
      if (!fee) return;

      const amt = Number(fee.amount) || 0;

      if (fee.status === 'paid') {
        paidCount++;
        totalCollectedAmount += amt;

        const isThisMonth =
          (fee.paid_at && fee.paid_at.startsWith(currentMonth)) ||
          (fee.due_date && fee.due_date.startsWith(currentMonth));
        if (isThisMonth) {
          monthCollected += amt;
          hasMonthData = true;
        }
      } else if (fee.status === 'overdue') {
        overdueCount++;
        totalDueAmount += amt;

        const isThisMonth = fee.due_date && fee.due_date.startsWith(currentMonth);
        if (isThisMonth) {
          monthOutstanding += amt;
          hasMonthData = true;
        }
      } else if (fee.status === 'pending') {
        pendingCount++;
        totalDueAmount += amt;

        const isThisMonth = fee.due_date && fee.due_date.startsWith(currentMonth);
        if (isThisMonth) {
          monthOutstanding += amt;
          hasMonthData = true;
        }
      }
    });

    if (summary) {
      if (typeof summary.paidCount === 'number') paidCount = summary.paidCount;
      if (typeof summary.pendingCount === 'number') pendingCount = summary.pendingCount;
      if (typeof summary.overdueCount === 'number') overdueCount = summary.overdueCount;
      if (typeof summary.totalDueAmount === 'number') totalDueAmount = summary.totalDueAmount;
    }

    const collectedThisMonth = hasMonthData ? monthCollected : totalCollectedAmount;
    const outstandingThisMonth = hasMonthData ? monthOutstanding : totalDueAmount;
    const totalMonthAmount = collectedThisMonth + outstandingThisMonth;

    const totalStudentsCount = paidCount + pendingCount + overdueCount;
    const collectionRate =
      totalMonthAmount > 0
        ? Math.round((collectedThisMonth / totalMonthAmount) * 100)
        : totalStudentsCount > 0
        ? Math.round((paidCount / totalStudentsCount) * 100)
        : 0;

    // Conic gradient for Status Donut (Green #15803D, Indigo #3730A3, Red #DC2626)
    let statusGradient = 'conic-gradient(#e2e8f0 0% 100%)';
    if (totalStudentsCount > 0) {
      const paidPct = (paidCount / totalStudentsCount) * 100;
      const pendingPct = (pendingCount / totalStudentsCount) * 100;
      statusGradient = `conic-gradient(
        #15803D 0% ${paidPct.toFixed(1)}%,
        #3730A3 ${paidPct.toFixed(1)}% ${(paidPct + pendingPct).toFixed(1)}%,
        #DC2626 ${(paidPct + pendingPct).toFixed(1)}% 100%
      )`;
    }

    // Conic gradient for Amount Donut (Green #15803D, Red #DC2626)
    let monthGradient = 'conic-gradient(#e2e8f0 0% 100%)';
    if (totalMonthAmount > 0 || totalStudentsCount > 0) {
      monthGradient = `conic-gradient(
        #15803D 0% ${collectionRate}%,
        #DC2626 ${collectionRate}% 100%
      )`;
    }

    return {
      totalStudentsCount,
      paidCount,
      pendingCount,
      overdueCount,
      totalDueAmount,
      collectedThisMonth,
      outstandingThisMonth,
      collectionRate,
      statusGradient,
      monthGradient,
    };
  }, [students, summary]);

  return (
    <section
      className="collections-overview-card"
      style={{
        backgroundColor: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: 'var(--color-primary-container)' }}
          >
            pie_chart
          </span>
          <h2
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              margin: 0,
            }}
          >
            Collections Overview
          </h2>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: 'var(--color-surface-container)',
            color: 'var(--color-on-surface-variant)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Monthly
        </span>
      </div>

      {/* 3 Summary Metrics Pill Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {/* Metric 1: Total Outstanding */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-low)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--color-on-surface-variant)',
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            Outstanding
          </span>
          <span
            className="tabular-nums"
            style={{
              fontSize: '14px',
              fontWeight: 900,
              color: '#3730A3',
              display: 'block',
              marginTop: '2px',
            }}
          >
            ₹{metrics.totalDueAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Metric 2: Collection Rate */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-low)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--color-on-surface-variant)',
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            Collection Rate
          </span>
          <span
            className="tabular-nums"
            style={{
              fontSize: '14px',
              fontWeight: 900,
              color: '#15803D',
              display: 'block',
              marginTop: '2px',
            }}
          >
            {metrics.collectionRate}%
          </span>
        </div>

        {/* Metric 3: Overdue Count */}
        <div
          style={{
            backgroundColor: metrics.overdueCount > 0 ? 'var(--color-error-container)' : 'var(--color-surface-low)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: metrics.overdueCount > 0 ? 'var(--color-error)' : 'var(--color-on-surface-variant)',
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            Overdue
          </span>
          <span
            className="tabular-nums"
            style={{
              fontSize: '14px',
              fontWeight: 900,
              color: metrics.overdueCount > 0 ? '#DC2626' : 'var(--color-on-surface)',
              display: 'block',
              marginTop: '2px',
            }}
          >
            {metrics.overdueCount}
          </span>
        </div>
      </div>

      {/* Donut Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          paddingTop: '2px',
        }}
      >
        {/* Left Donut Chart: By Status */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface-low)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: '8px',
            }}
          >
            By Status
          </span>
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: metrics.statusGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'var(--color-surface-card)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--color-on-surface)',
                }}
              >
                {metrics.totalStudentsCount}
              </span>
            </div>
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-on-surface-variant)',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: '#15803D', fontWeight: 700 }}>
              Paid: {metrics.paidCount}
            </span>
            <br />
            <span style={{ color: '#3730A3', fontWeight: 700 }}>
              Pending: {metrics.pendingCount}
            </span>
            <br />
            <span style={{ color: '#DC2626', fontWeight: 700 }}>
              Overdue: {metrics.overdueCount}
            </span>
          </div>
        </div>

        {/* Right Donut Chart: This Month */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface-low)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: '8px',
            }}
          >
            This Month
          </span>
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: metrics.monthGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'var(--color-surface-card)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--color-on-surface)',
                }}
              >
                {metrics.collectionRate}%
              </span>
            </div>
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-on-surface-variant)',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: '#15803D', fontWeight: 700 }}>
              Collected: {formatCompactCurrency(metrics.collectedThisMonth)}
            </span>
            <br />
            <span style={{ color: '#DC2626', fontWeight: 700 }}>
              Due: {formatCompactCurrency(metrics.outstandingThisMonth)}
            </span>
          </div>
        </div>
      </div>

      {/* Third Stat Bar */}
      <div
        style={{
          marginTop: 'var(--space-3)',
          paddingTop: 'var(--space-2)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: 'var(--color-on-surface-variant)',
            fontWeight: 500,
          }}
        >
          Monthly Collection Rate
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 900,
            color: '#3730A3',
          }}
        >
          Collection Rate: {metrics.collectionRate}%
        </span>
      </div>
    </section>
  );
}
