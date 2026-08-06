// Frontend/src/pages/Integrations.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { api, logAudit } from "../Services/api";
import "../style/Integrations.css";

export default function Integrations() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name"); // name | risk | lastUsed
  const [dir, setDir] = useState("asc"); // asc | desc
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type, app }

  const debouncedQuery = useDebounce(query, 350);
  const busyRef = useRef(false);

  // ---- fetch from backend ----
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/integrations");
        const list = (res.data || []).map((doc) => ({
          ...doc,
          id: doc._id,
        }));
        setApps(list);
      } catch (e) {
        console.error(e);
        setError(e.message || "Could not load integrations");
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  // ---- client-side filter + sort + paginate ----
  const { visibleApps, totalPages } = useMemo(() => {
    let list = [...apps];

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sort === "name") {
        const an = (a.name || "").toLowerCase();
        const bn = (b.name || "").toLowerCase();
        return dir === "asc" ? an.localeCompare(bn) : bn.localeCompare(an);
      }

      if (sort === "lastUsed") {
        const ad = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bd = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dir === "asc" ? ad - bd : bd - ad;
      }

      if (sort === "risk") {
        const ra = computeRisk(a);
        const rb = computeRisk(b);
        const score = (lvl) =>
          lvl === "high" ? 3 : lvl === "medium" ? 2 : 1;
        const sa = score(ra.level);
        const sb = score(rb.level);
        return dir === "asc" ? sa - sb : sb - sa;
      }

      return 0;
    });

    const totalPages =
      list.length === 0 ? 1 : Math.ceil(list.length / pageSize);
    const start = (page - 1) * pageSize;
    const visible = list.slice(start, start + pageSize);

    return { visibleApps: visible, totalPages };
  }, [apps, debouncedQuery, sort, dir, page, pageSize]);

  // ---- actions ----
  const beginConnect = async (app) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      await api.patch(`/integrations/${app.id}`, { connected: true });

      setApps((list) =>
        list.map((a) => (a.id === app.id ? { ...a, connected: true } : a))
      );

      await logAudit(`Connected integration: ${app.name}`, "Satyam");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to connect");
    } finally {
      busyRef.current = false;
    }
  };

  const requestDisconnect = (app) => {
    setPendingAction({ type: "disconnect", app });
    setConfirmOpen(true);
  };

  const performDisconnect = async () => {
    if (!pendingAction) return;
    const { app } = pendingAction;
    setConfirmOpen(false);

    const prev = apps.slice();
    setApps((list) =>
      list.map((a) => (a.id === app.id ? { ...a, connected: false } : a))
    );

    try {
      await api.patch(`/integrations/${app.id}`, { connected: false });
      await logAudit(`Disconnected integration: ${app.name}`, "Satyam");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to disconnect");
      setApps(prev);
    } finally {
      setPendingAction(null);
    }
  };

  // ---- UI ----
  return (
    <div className="integrations-page">
      <header className="integrations-header">
        <h1 className="integrations-title">Integrations</h1>

        <div className="integrations-filters">
          <SearchBox value={query} onChange={setQuery} />
          <SortMenu sort={sort} dir={dir} onSort={setSort} onDir={setDir} />
          <PageSizer value={pageSize} onChange={setPageSize} />
        </div>
      </header>

      {error && (
        <div role="alert" className="integrations-error">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : visibleApps.length === 0 ? (
        <EmptyState onReload={() => setPage(1)} />
      ) : (
        <>
          <div
            className="integrations-grid"
            role="list"
            aria-label="Connected applications"
          >
            {visibleApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onConnect={() => beginConnect(app)}
                onDisconnect={() => requestDisconnect(app)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Disconnect integration?"
        description={
          pendingAction?.app
            ? `This will revoke ${pendingAction.app.name}'s access to your data. You can reconnect anytime.`
            : ""
        }
        confirmText="Disconnect"
        variant="danger"
        onCancel={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={performDisconnect}
      />
    </div>
  );
}

/* ----------------- components ----------------- */

function AppCard({ app, onConnect, onDisconnect }) {
  const risk = computeRisk(app);

  return (
    <div role="listitem" className="integration-card">
      <div className="integration-top">
        <div className="integration-main">
          <div className="integration-icon">
            <span className="integration-icon-text">
              {app.name?.slice(0, 2) ?? "AP"}
            </span>
          </div>
          <div>
            <h4 className="integration-name">{app.name}</h4>
            <p className="integration-description">
              {app.description || app.access || "—"}
            </p>
            <MetaLine app={app} />
          </div>
        </div>

        <StatusPill connected={app.connected} />
      </div>

      {Array.isArray(app.scopes) && app.scopes.length > 0 && (
        <div className="integration-scopes">
          {app.scopes.slice(0, 6).map((s) => (
            <span key={s} title={s} className="scope-chip">
              {s}
            </span>
          ))}
          {app.scopes.length > 6 && (
            <span className="scope-chip scope-chip-more">
              +{app.scopes.length - 6} more
            </span>
          )}
        </div>
      )}

      <div className="integration-actions">
        {app.connected ? (
          <>
            <button
              onClick={onDisconnect}
              className="btn btn-disconnect"
              aria-label={`Disconnect ${app.name}`}
            >
              Disconnect
            </button>
            <RiskBadge level={risk.level} reason={risk.reason} />
          </>
        ) : (
          <button
            onClick={onConnect}
            className="btn btn-connect"
            aria-label={`Connect ${app.name}`}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

function MetaLine({ app }) {
  return (
    <div className="integration-meta">
      {app.vendor && <span title="Vendor">{app.vendor}</span>}
      {app.region && <span title="Data region">• {app.region}</span>}
      {app.verified && <span className="meta-pill">Verified</span>}
      {app.lastUsed && (
        <span title="Last used">• Last used {formatRelative(app.lastUsed)}</span>
      )}
    </div>
  );
}

function StatusPill({ connected }) {
  return (
    <span
      className={`status-pill ${
        connected ? "status-connected" : "status-disconnected"
      }`}
      aria-live="polite"
    >
      {connected ? "Connected" : "Disconnected"}
    </span>
  );
}

function RiskBadge({ level, reason }) {
  const cls =
    level === "high"
      ? "risk-high"
      : level === "medium"
      ? "risk-medium"
      : "risk-low";

  return (
    <span
      className={`risk-badge ${cls}`}
      title={reason}
      aria-label={`Risk: ${level}. ${reason}`}
    >
      Risk: {capitalize(level)}
    </span>
  );
}

function SkeletonGrid() {
  return (
    <div className="integrations-grid" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="integration-card integration-skeleton">
          <div className="skeleton-top">
            <div className="skeleton-icon skeleton-box" />
            <div className="skeleton-text">
              <div className="skeleton-line skeleton-box" />
              <div className="skeleton-line skeleton-box skeleton-line-short" />
            </div>
          </div>
          <div className="skeleton-button skeleton-box" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onReload }) {
  return (
    <div className="integration-empty">
      <p>No integrations found.</p>
      <button onClick={onReload} className="btn btn-dark">
        Reload
      </button>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="integrations-pagination">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="btn btn-outline"
        aria-label="Previous page"
      >
        Previous
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="btn btn-outline"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label className="search-box">
      <span className="sr-only">Search integrations</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search integrations…"
        className="input-search"
        type="search"
        autoComplete="off"
      />
      <span className="search-hint">⌘K</span>
    </label>
  );
}

function SortMenu({ sort, dir, onSort, onDir }) {
  return (
    <div className="sort-menu">
      <label className="sort-label">Sort</label>
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        className="select"
        aria-label="Sort by"
      >
        <option value="name">Name</option>
        <option value="risk">Risk</option>
        <option value="lastUsed">Last used</option>
      </select>
      <button
        onClick={() => onDir((d) => (d === "asc" ? "desc" : "asc"))}
        className="btn btn-icon"
        aria-label={`Sort direction ${
          dir === "asc" ? "ascending" : "descending"
        }`}
        title="Toggle sort direction"
      >
        {dir === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
}

function PageSizer({ value, onChange }) {
  return (
    <div className="page-sizer">
      <label htmlFor="pageSize" className="sort-label">
        Per page
      </label>
      <select
        id="pageSize"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="select"
      >
        {[6, 9, 12, 18].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  variant = "primary",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const confirmClass =
    variant === "danger" ? "btn btn-disconnect" : "btn btn-connect";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-backdrop"
      onClick={onCancel}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon">⚠️</div>
          <div>
            <h2 className="modal-title">{title}</h2>
            <p className="modal-description">{description}</p>
          </div>
        </div>
        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={confirmClass}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- helpers ----------------- */

function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function computeRisk(app) {
  const scopes = new Set(app.scopes || []);
  const high = [
    "billing.read",
    "files.write",
    "contacts.write",
    "dm.read",
    "email.read",
    "location.precise",
  ];
  const medium = [
    "ads.personalization",
    "files.read",
    "contacts.read",
    "analytics.read",
  ];
  let score = 0;
  high.forEach((s) => scopes.has(s) && (score += 3));
  medium.forEach((s) => scopes.has(s) && (score += 1));
  if (app.lastUsed && daysSince(app.lastUsed) > 90) score += 1;
  if (["payments", "storage"].includes(app.category)) score += 1;

  const level = score >= 4 ? "high" : score >= 2 ? "medium" : "low";
  const reason =
    level === "high"
      ? "Broad data access (e.g., files/billing) or inactive >90d"
      : level === "medium"
      ? "Analytics/ads scopes or moderate permissions"
      : "Minimal required scopes";
  return { level, reason };
}

function formatRelative(iso) {
  try {
    const d = new Date(iso);
    const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "—";
  }
}

function daysSince(iso) {
  try {
    const d = new Date(iso).getTime();
    return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

function capitalize(s) {
  return (s || "").slice(0, 1).toUpperCase() + (s || "").slice(1);
}
