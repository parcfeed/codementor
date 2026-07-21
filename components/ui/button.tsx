import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "default" | "sm";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "h-10",
  sm: "h-9",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * Bouton unifié du design system. Wraps les classes `.btn-*` définies dans
 * globals.css pour garantir la cohérence visuelle et l'accessibilité
 * (focus-visible, état disabled) sur tous les formulaires de l'app.
 *
 * Pour les liens stylés comme des boutons, utiliser directement les classes
 * `.btn-primary` / `.btn-secondary` sur un <Link>.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "default", className, type, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
        type={type ?? "button"}
        {...props}
      />
    );
  },
);
