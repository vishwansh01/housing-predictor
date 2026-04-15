"use client";

import { useEffect, useState } from "react";
import type { FormValues, PredictionResult } from "./HousingPredictor";

interface Props {
  result: PredictionResult;
  form: FormValues;
}
// interface Props {
//   result: PredictionResult;
//   form: Record<string, string>;
// }

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function getPriceTier(price: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  if (price < 120000)
    return {
      label: "Affordable",
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.2)",
    };
  if (price < 250000)
    return {
      label: "Mid-Range",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.08)",
      border: "rgba(96,165,250,0.2)",
    };
  if (price < 400000)
    return {
      label: "Upper-Mid",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
    };
  if (price < 600000)
    return {
      label: "Premium",
      color: "#f97316",
      bg: "rgba(249,115,22,0.08)",
      border: "rgba(249,115,22,0.2)",
    };
  return {
    label: "Luxury",
    color: "#e879f9",
    bg: "rgba(232,121,249,0.08)",
    border: "rgba(232,121,249,0.2)",
  };
}

function useAnimatedNumber(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return current;
}

export default function ResultPanel({ result, form }: Props) {
  const price = result.predicted_price;
  const animatedPrice = useAnimatedNumber(price);
  const tier = getPriceTier(price);

  const stats = [
    {
      label: "Per Room",
      value: formatPrice(
        price / Math.max(parseFloat(form.total_rooms) || 1, 1),
      ),
    },
    {
      label: "Income Ratio",
      value: `${(price / 1000 / (parseFloat(form.median_income) * 10)).toFixed(1)}×`,
    },
    {
      label: "Occupancy",
      value: `${(parseFloat(form.population) / Math.max(parseFloat(form.households) || 1, 1)).toFixed(1)} ppl/unit`,
    },
    {
      label: "Bedroom Ratio",
      value: `${((parseFloat(form.total_bedrooms) / Math.max(parseFloat(form.total_rooms) || 1, 1)) * 100).toFixed(0)}%`,
    },
  ];

  return (
    <div
      className="animate-fade-up"
      style={{
        marginTop: "1.75rem",
        opacity: 0,
      }}
    >
      {/* Main result card */}
      <div
        style={{
          background: "var(--color-surface)",
          border: `1px solid ${tier.border}`,
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: `0 0 40px ${tier.bg}, 0 4px 32px rgba(0,0,0,0.4)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "300px",
            background: `radial-gradient(ellipse at top right, ${tier.bg} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            position: "relative",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "var(--color-muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Estimated Median Home Value
            </p>
            <div
              className="animate-count"
              style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: tier.color,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {formatPrice(animatedPrice)}
              </span>
            </div>
          </div>

          <div
            style={{
              background: tier.bg,
              border: `1px solid ${tier.border}`,
              borderRadius: "2rem",
              padding: "0.4rem 0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: tier.color,
                display: "inline-block",
                boxShadow: `0 0 6px ${tier.color}`,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.78rem",
                color: tier.color,
                letterSpacing: "0.04em",
              }}
            >
              {tier.label}
            </span>
          </div>
        </div>

        {/* Price bar visualization */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div
            style={{
              height: "4px",
              background: "var(--color-border)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min((price / 700000) * 100, 100)}%`,
                background: `linear-gradient(to right, ${tier.color}80, ${tier.color})`,
                borderRadius: "2px",
                transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.4rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              color: "var(--color-muted)",
              opacity: 0.6,
            }}
          >
            <span>$0</span>
            <span>$350K</span>
            <span>$700K+</span>
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "var(--color-border)",
            borderRadius: "0.625rem",
            overflow: "hidden",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--color-surface-2)",
                padding: "0.875rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  color: "var(--color-text)",
                  marginBottom: "0.25rem",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--color-muted)",
                  opacity: 0.7,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Location summary */}
        <div
          style={{
            marginTop: "1.25rem",
            padding: "0.875rem 1rem",
            background: "var(--color-bg)",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <Coord label="Lat" value={form.latitude} />
          <Coord label="Lon" value={form.longitude} />
          <div
            style={{
              height: "1rem",
              width: "1px",
              background: "var(--color-border)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--color-muted)",
            }}
          >
            {form.ocean_proximity}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--color-muted)",
            }}
          >
            Age: {form.housing_median_age} yrs
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--color-muted)",
            }}
          >
            Inc: ${(parseFloat(form.median_income) * 10).toFixed(0)}K
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "var(--color-muted)",
          opacity: 0.5,
          marginTop: "0.875rem",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        Prediction based on California Housing Dataset (1990 Census). For
        informational purposes only.
      </p>
    </div>
  );
}

function Coord({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          color: "var(--color-muted)",
          opacity: 0.6,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.78rem",
          color: "var(--color-accent-bright)",
        }}
      >
        {parseFloat(value).toFixed(4)}°
      </span>
    </span>
  );
}
