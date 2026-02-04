"use client";

import { Toaster } from "react-hot-toast";

/**
 * Global toast notification provider (react-hot-toast).
 * Renders a single Toaster; wrap app with this once (e.g. in ClientProviders).
 */
export default function ToastContext() {
  return (
    <Toaster position="top-center" reverseOrder={false} />
  );
}
