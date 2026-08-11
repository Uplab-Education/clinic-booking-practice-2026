import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
  secondary: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
};

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: false;
  };

type ButtonAsLink = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    asChild: true;
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { children, className, variant = "primary" } = props;
  const classes = cn(
    "inline-flex min-h-9 items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className,
  );

  if (props.asChild) {
    return (
      <Link className={classes} href={props.href}>
        {children}
      </Link>
    );
  }

  return (
    <BaseButton
      className={classes}
      disabled={props.disabled}
      onClick={props.onClick}
      type={props.type}
    >
      {children}
    </BaseButton>
  );
}
