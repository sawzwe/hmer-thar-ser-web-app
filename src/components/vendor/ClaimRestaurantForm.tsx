"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  area: string;
}

interface ClaimRestaurantFormProps {
  userId: string;
  existingRestaurants: Restaurant[];
}

export function ClaimRestaurantForm({
  userId,
  existingRestaurants,
}: ClaimRestaurantFormProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = existingRestaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleClaim = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/vendor/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to submit claim" });
      } else {
        setMessage({ type: "success", text: "Claim submitted! We'll review it soon." });
        setSelectedId(null);
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-lg space-y-6">
      <Input
        label="Search existing restaurants"
        placeholder="Type restaurant name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (
        <div className="border border-border rounded-[var(--radius-md)] overflow-hidden max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-text-muted">
              No matches. Add your restaurant via Supabase when it doesn&apos;t
              exist yet.
            </div>
          ) : (
            filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                className={`block w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-card transition-colors ${
                  selectedId === r.id ? "bg-brand-dim border-brand-border" : ""
                }`}
              >
                <div className="font-medium text-text-primary">{r.name}</div>
                <div className="text-xs text-text-muted">
                  {r.area} · {r.slug}
                </div>
              </button>
            ))
          )}
        </div>
      )}
      {selectedId && (
        <div className="flex gap-4 items-center">
          <Button
            onClick={handleClaim}
            variant="primary"
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit claim"}
          </Button>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-sm text-text-muted hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      )}
      {message && (
        <div
          className={`p-4 rounded-[var(--radius-md)] text-sm ${
            message.type === "success"
              ? "bg-success-dim text-success border border-success-border"
              : "bg-danger-dim text-danger border border-danger-border"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
