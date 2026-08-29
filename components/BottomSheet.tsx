"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Bottom-sheet on mobile, centered modal on larger screens — same
 * component, same content, the CSS just repositions it per breakpoint.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-sheet border border-white/10 bg-base-900 p-6 sm:max-w-[480px] sm:rounded-card sm:border sm:mb-0 mb-0"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg text-white">{title}</h2>
                {subtitle && (
                  <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/[0.16] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
