import React from "react";

export default function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/10 dark:bg-white/10 rounded" />
        </td>
      ))}
    </tr>
  );
}
