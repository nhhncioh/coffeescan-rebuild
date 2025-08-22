import React from "react";

export function Switch({ id, checked, onCheckedChange }: { id: string; checked: boolean; onCheckedChange: (value: boolean) => void }) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="h-5 w-10 rounded-full bg-gray-300 checked:bg-amber-500 transition-all appearance-none relative cursor-pointer"
    />
  );
}
