"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useRef } from "react";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  decimals = 0,
  className,
  size = "md",
  disabled = false,
}: StepperProps) {
  const longPressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const round = (v: number) => parseFloat(v.toFixed(decimals));

  const increment = useCallback(() => onChange(clamp(round(value + step))), [value, step, min, max]);
  const decrement = useCallback(() => onChange(clamp(round(value - step))), [value, step, min, max]);

  const startLongPress = (fn: () => void) => {
    fn();
    longPressRef.current = setInterval(fn, 150);
  };
  const stopLongPress = () => {
    if (longPressRef.current) {
      clearInterval(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const btnCls = size === "sm"
    ? "w-9 h-9 flex items-center justify-center rounded-xl active:bg-muted/80 text-muted-foreground active:text-foreground transition-colors select-none touch-none"
    : "w-11 h-11 flex items-center justify-center rounded-xl active:bg-muted/80 text-muted-foreground active:text-foreground transition-colors select-none touch-none";

  const iconSize = size === "sm" ? 14 : 16;
  const textCls = size === "sm" ? "text-base font-bold w-12 text-center" : "text-lg font-bold w-14 text-center";

  return (
    <div className={cn(
      "flex items-center gap-0.5 bg-muted/50 rounded-2xl p-0.5",
      disabled && "opacity-50 pointer-events-none",
      className
    )}>
      <button
        type="button"
        className={btnCls}
        onPointerDown={() => startLongPress(decrement)}
        onPointerUp={stopLongPress}
        onPointerLeave={stopLongPress}
        disabled={disabled}
      >
        <Minus size={iconSize} strokeWidth={2.5} />
      </button>
      <span className={textCls}>
        {decimals > 0 ? value.toFixed(decimals) : value}
      </span>
      <button
        type="button"
        className={btnCls}
        onPointerDown={() => startLongPress(increment)}
        onPointerUp={stopLongPress}
        onPointerLeave={stopLongPress}
        disabled={disabled}
      >
        <Plus size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
}
