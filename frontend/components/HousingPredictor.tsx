"use client";

import { useState, useRef } from "react";
import ResultPanel from "./ResultPanel";
import MapPin from "./MapPin";

const OCEAN_OPTIONS = [
  { value: "NEAR BAY", label: "Near Bay" },
  { value: "INLAND", label: "Inland" },
  { value: "NEAR OCEAN", label: "Near Ocean" },
  { value: "<1H OCEAN", label: "< 1H from Ocean" },
  { value: "ISLAND", label: "Island" },
];

export interface PredictionResult {
  predicted_price: number;
  confidence?: number;
}

export interface FormValues {
  longitude: string;
  latitude: string;
  housing_median_age: string;
  total_rooms: string;
  total_bedrooms: string;
  population: string;
  households: string;
  median_income: string;
  ocean_proximity: string;
}

const DEFAULT_FORM: FormValues = {
  longitude: "-122.23",
  latitude: "37.88",
  housing_median_age: "41",
  total_rooms: "880",
  total_bedrooms: "129",
  population: "322",
  households: "126",
  median_income: "8.3252",
  ocean_proximity: "NEAR BAY",
};

const FIELDS: {
  key: keyof FormValues;
  label: string;
  placeholder: string;
  hint: string;
  type: "number" | "select";
  step?: string;
  min?: string;
  max?: string;
}[] = [
  {
    key: "longitude",
    label: "Longitude",
    placeholder: "-122.23",
    hint: "Western California: −114 to −124",
    type: "number",
    step: "0.0001",
  },
  {
    key: "latitude",
    label: "Latitude",
    placeholder: "37.88",
    hint: "California range: 32° to 42°",
    type: "number",
    step: "0.0001",
  },
  {
    key: "housing_median_age",
    label: "Median Housing Age",
    placeholder: "41",
    hint: "Years — typical range: 1–52",
    type: "number",
    step: "1",
    min: "1",
    max: "100",
  },
  {
    key: "total_rooms",
    label: "Total Rooms",
    placeholder: "880",
    hint: "All rooms across all units in block",
    type: "number",
    step: "1",
    min: "1",
  },
  {
    key: "total_bedrooms",
    label: "Total Bedrooms",
    placeholder: "129",
    hint: "All bedrooms across the block",
    type: "number",
    step: "1",
    min: "1",
  },
  {
    key: "population",
    label: "Population",
    placeholder: "322",
    hint: "Total residents in block group",
    type: "number",
    step: "1",
    min: "1",
  },
  {
    key: "households",
    label: "Households",
    placeholder: "126",
    hint: "Number of households in block",
    type: "number",
    step: "1",
    min: "1",
  },
  {
    key: "median_income",
    label: "Median Income",
    placeholder: "8.3252",
    hint: "In $10,000s — e.g. 8.3 = $83,000",
    type: "number",
    step: "0.0001",
    min: "0",
  },
  {
    key: "ocean_proximity",
    label: "Ocean Proximity",
    placeholder: "",
    hint: "Distance category from the ocean",
    type: "select",
  },
];

export default function HousingPredictor() {
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000");
  const resultRef = useRef<HTMLDivElement>(null);

  const handleChange = (key: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (result) setResult(null);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      longitude: parseFloat(form.longitude),
      latitude: parseFloat(form.latitude),
      housing_median_age: parseFloat(form.housing_median_age),
      total_rooms: parseFloat(form.total_rooms),
      total_bedrooms: parseFloat(form.total_bedrooms),
      population: parseFloat(form.population),
      households: parseFloat(form.households),
      median_income: parseFloat(form.median_income),
      ocean_proximity: form.ocean_proximity,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.detail || `Server error: ${res.status}`);
      }

      const data: PredictionResult = await res.json();
      setResult(data);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        100,
      );
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Could not reach the API. Check your Hugging Face Space URL or CORS settings.",
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Unexpected error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(form).every(
    (v) => v !== "" && v !== undefined,
  );

  return (
    <div className="min-h-screen grid-bg relative">
      {/* Ambient glow top */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:px-6">
        {/* Header */}
        <header className="mb-12 animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div
              style={{
                width: "38px",
                height: "38px",
                background:
                  "linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
              }}
            >
              <MapPin size={18} color="#fff" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "var(--color-text)",
                letterSpacing: "0.02em",
              }}
            >
              HouseVal
            </span>
            <span
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.2)",
                color: "var(--color-accent-bright)",
                fontSize: "0.65rem",
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                letterSpacing: "0.1em",
                padding: "2px 8px",
                borderRadius: "20px",
                marginLeft: "4px",
              }}
            >
              ML · BETA
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              lineHeight: 1.08,
              color: "var(--color-text)",
              marginBottom: "1rem",
            }}
          >
            Housing Price
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--color-accent-bright), var(--color-gold))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Prediction Engine
            </span>
          </h1>

          <p
            style={{
              color: "var(--color-muted)",
              fontSize: "1rem",
              lineHeight: 1.65,
              maxWidth: "520px",
            }}
          >
            Enter California block-group data to estimate median home values
            using a trained machine learning model deployed on Hugging Face
            Spaces.
          </p>
        </header>

        {/* API URL Config */}
        <div
          className="card mb-8 animate-fade-up"
          style={{
            padding: "1.25rem 1.5rem",
            animationDelay: "0.05s",
            opacity: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--color-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              API Endpoint
            </span>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="input-field"
                style={{ paddingRight: "5rem" }}
                placeholder="https://your-model.hf.space"
              />
              <span
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: "var(--color-accent-bright)",
                  opacity: 0.7,
                  pointerEvents: "none",
                }}
              >
                /predict
              </span>
            </div>
          </div>
        </div>

        {/* Main Form Grid */}
        <div
          className="card mb-6 animate-fade-up"
          style={{ padding: "2rem", animationDelay: "0.1s", opacity: 0 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.75rem",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "20px",
                background:
                  "linear-gradient(to bottom, var(--color-accent), transparent)",
                borderRadius: "2px",
              }}
            />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1rem",
                color: "var(--color-text)",
                letterSpacing: "0.02em",
              }}
            >
              Block Group Parameters
            </h2>
          </div>

          {/* Section: Location */}
          <SectionLabel label="Location" icon="◎" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {FIELDS.filter((f) =>
              ["longitude", "latitude"].includes(f.key),
            ).map((field) => (
              <InputField
                key={field.key}
                field={field}
                value={form[field.key]}
                onChange={(v) => handleChange(field.key, v)}
              />
            ))}
          </div>

          {/* Section: Property */}
          <SectionLabel label="Property Details" icon="⬡" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {FIELDS.filter((f) =>
              ["housing_median_age", "total_rooms", "total_bedrooms"].includes(
                f.key,
              ),
            ).map((field) => (
              <InputField
                key={field.key}
                field={field}
                value={form[field.key]}
                onChange={(v) => handleChange(field.key, v)}
              />
            ))}
          </div>

          {/* Section: Demographics */}
          <SectionLabel label="Demographics" icon="◈" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {FIELDS.filter((f) =>
              ["population", "households", "median_income"].includes(f.key),
            ).map((field) => (
              <InputField
                key={field.key}
                field={field}
                value={form[field.key]}
                onChange={(v) => handleChange(field.key, v)}
              />
            ))}
          </div>

          {/* Section: Geography */}
          <SectionLabel label="Geography" icon="◌" />
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.filter((f) => f.key === "ocean_proximity").map((field) => (
              <InputField
                key={field.key}
                field={field}
                value={form[field.key]}
                onChange={(v) => handleChange(field.key, v)}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="animate-fade-up"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "0.625rem",
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <span
              style={{ color: "#ef4444", fontSize: "1.1rem", lineHeight: 1 }}
            >
              ⚠
            </span>
            <p
              style={{
                color: "#fca5a5",
                fontSize: "0.875rem",
                lineHeight: 1.5,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: "0.15s", opacity: 0 }}
        >
          <button
            className="btn-primary w-full"
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <LoadingSpinner />
                Calculating estimate…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Generate Price Prediction</span>
                <span style={{ opacity: 0.7 }}>→</span>
              </span>
            )}
          </button>
        </div>

        {/* Result */}
        <div ref={resultRef}>
          {result && <ResultPanel result={result} form={form} />}
        </div>

        {/* Footer */}
        <footer
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--color-muted)",
              opacity: 0.6,
            }}
          >
            Predictions based on California Housing Dataset · Model served via
            Hugging Face Spaces
          </p>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--color-muted)",
              opacity: 0.5,
            }}
          >
            FastAPI · scikit-learn
          </span>
        </footer>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */
/* Sub-components                                   */
/* ──────────────────────────────────────────────── */

function SectionLabel({ label, icon }: { label: string; icon: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.875rem",
      }}
    >
      <span style={{ color: "var(--color-accent)", fontSize: "0.8rem" }}>
        {icon}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.72rem",
          color: "var(--color-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "var(--color-border)",
          marginLeft: "0.25rem",
        }}
      />
    </div>
  );
}

type FieldDef = (typeof FIELDS)[number];

function InputField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label-text">{field.label}</label>
      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
          style={{
            cursor: "pointer",
            appearance: "none",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b8aad' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            paddingRight: "2rem",
          }}
        >
          {OCEAN_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ background: "var(--color-surface)" }}
            >
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          className="input-field"
          value={value}
          step={field.step}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--color-muted)",
          marginTop: "0.35rem",
          opacity: 0.65,
        }}
      >
        {field.hint}
      </p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      style={{ animation: "spin-slow 0.8s linear infinite" }}
    >
      <circle
        cx="9"
        cy="9"
        r="7"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
      />
      <path
        d="M9 2a7 7 0 0 1 7 7"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
