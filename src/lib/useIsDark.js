"use client";

import { useSyncExternalStore } from "react";

function subscribeToTheme(onStoreChange) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getIsDark = () => document.documentElement.classList.contains("dark");

// Matches the inline script in layout.js, which defaults to dark.
const getIsDarkOnServer = () => true;

export function useIsDark() {
  return useSyncExternalStore(subscribeToTheme, getIsDark, getIsDarkOnServer);
}

export function toggleTheme() {
  const nextDark = !getIsDark();
  document.documentElement.classList.toggle("dark", nextDark);
  localStorage.setItem("theme", nextDark ? "dark" : "light");
}
