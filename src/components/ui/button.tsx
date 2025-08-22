import { cva } from "class-variance-authority";
import React from "react";
import clsx from "clsx";

const button = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none bg-amber-500 text-white hover:bg-amber-600",
);

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx(button(), className)} {...props} />;
}
