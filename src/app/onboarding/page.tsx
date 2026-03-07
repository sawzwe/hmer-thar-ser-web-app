"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, MapPin, CaretLeft } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageStore } from "@/stores/languageStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useLocationStore } from "@/stores/locationStore";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const LANG_OPTIONS = [
  { value: "en" as const, label: "English", flag: "🇬🇧" },
  { value: "my" as const, label: "မြန်မာ", flag: "🇲🇲" },
] as const;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function OnboardingPage() {
  const router = useRouter();
  const lang = useLanguageStore((s) => s.lang);
  const setLang = useLanguageStore((s) => s.setLang);
  const step = useOnboardingStore((s) => s.step);
  const setStep = useOnboardingStore((s) => s.setStep);
  const setGuestEmail = useOnboardingStore((s) => s.setGuestEmail);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const setLocation = useLocationStore((s) => s.setLocation);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleLangSelect = (value: "en" | "my") => {
    setLang(value);
    setStep(2);
  };

  const handleEnableLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError(t(lang, "onboardLocationUnsupported"));
      return;
    }
    if (!window.isSecureContext) {
      setLocationError(t(lang, "onboardLocationSecureRequired"));
      return;
    }
    // Call getCurrentPosition FIRST - before any setState - so the browser
    // recognizes it as a direct user gesture and shows the permission prompt.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude);
        setLocationLoading(false);
        setLocationError("");
        setStep(3);
      },
      (err) => {
        setLocationLoading(false);
        setLocationError(
          err.code === 1
            ? t(lang, "onboardLocationDenied")
            : t(lang, "onboardLocationError"),
        );
      },
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 0 },
    );
    setLocationLoading(true);
    setLocationError("");
  };

  const handleLocationSkip = () => {
    setStep(3);
  };

  const handleSkip = () => {
    setGuestEmail(null);
    completeOnboarding();
    router.replace("/");
  };

  const handleSave = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      handleSkip();
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError(t(lang, "onboardEmailInvalid"));
      return;
    }
    setEmailError("");
    setGuestEmail(trimmed);
    completeOnboarding();
    router.replace("/");
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 py-8">
      <div className="flex flex-col items-center w-full max-w-sm gap-8">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="self-start flex items-center gap-1.5 text-[14px] font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            <CaretLeft size={18} weight="bold" />
            {t(lang, "back")}
          </button>
        )}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center overflow-hidden">
            <Logo size={36} objectFit="cover" />
          </div>
          <h1 className="text-xl font-bold text-text-primary text-center font-sans">
            {step === 1 && t(lang, "onboardWelcome")}
            {step === 2 && t(lang, "onboardLocationTitle")}
            {step === 3 && t(lang, "onboardEmailTitle")}
          </h1>
        </div>

        {/* Step 1: Language */}
        {step === 1 && (
          <>
            <p className="text-[15px] text-text-secondary text-center">
              {t(lang, "onboardChooseLang")}
            </p>
            <div className="flex flex-col gap-3 w-full">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleLangSelect(opt.value)}
                  className={cn(
                    "flex items-center gap-4 w-full p-4 rounded-[var(--radius-lg)] border-2 transition-all duration-200",
                    lang === opt.value
                      ? "border-brand bg-brand-dim text-text-primary"
                      : "border-border-strong bg-surface hover:border-brand/50 hover:bg-card text-text-primary",
                  )}
                >
                  <span className="text-2xl">{opt.flag}</span>
                  <span
                    className={cn(
                      "font-semibold text-[15px]",
                      opt.value === "my" && "font-my",
                    )}
                  >
                    {opt.label}
                  </span>
                  <Globe size={20} weight="regular" className="ml-auto text-text-muted" />
                </button>
              ))}
            </div>
            <Button className="w-full" size="lg" onClick={() => setStep(2)}>
              {t(lang, "onboardContinue")} →
            </Button>
          </>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <>
            <p className="text-[15px] text-text-secondary text-center">
              {t(lang, "onboardLocationSub")}
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                type="button"
                onClick={handleEnableLocation}
                disabled={locationLoading}
                className="inline-flex items-center justify-center gap-2 w-full h-[50px] px-7 rounded-[var(--radius-lg)] text-[15px] font-semibold bg-brand text-white hover:bg-brand-hover cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {locationLoading ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                ) : (
                  <MapPin size={20} weight="fill" className="shrink-0" />
                )}
                {t(lang, "onboardEnableLocation")}
              </button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleLocationSkip}
                disabled={locationLoading}
              >
                {t(lang, "onboardLocationSkip")}
              </Button>
            </div>
            {locationError && (
              <p className="text-[13px] text-danger">{locationError}</p>
            )}
          </>
        )}

        {/* Step 3: Email */}
        {step === 3 && (
          <>
            <p className="text-[15px] text-text-secondary text-center">
              {t(lang, "onboardEmailSub")}
            </p>
            <div className="w-full space-y-4">
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                label={t(lang, "email")}
                placeholder={t(lang, "onboardEmailPlaceholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                error={emailError}
                className="text-[15px]"
              />
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="ghost" className="flex-1" onClick={handleSkip}>
                {t(lang, "onboardSkip")}
              </Button>
              <Button className="flex-1" size="lg" onClick={handleSave}>
                {t(lang, "onboardSave")}
              </Button>
            </div>
          </>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                step === s ? "bg-brand" : "bg-border-strong",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
