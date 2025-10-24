import React from "react";

export default function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 bg-gray-300/30 rounded"></div>
        </td>
      ))}
    </tr>
  );
}
