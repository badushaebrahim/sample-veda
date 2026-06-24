import React from "react";

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`w-full overflow-x-auto border border-cream-200/60 rounded-xl bg-white shadow-sm ${className}`}
      {...props}
    >
      <table className="w-full text-left border-collapse">{children}</table>
    </div>
  );
};

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <thead
      className={`bg-cream-100/50 border-b border-cream-200/60 text-xs font-semibold text-cream-900/70 tracking-wider uppercase select-none ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <tbody
      className={`divide-y divide-cream-100/70 text-sm text-cream-900/90 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <tr
      className={`hover:bg-cream-50/40 transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHeaderCell: React.FC<
  React.ThHTMLAttributes<HTMLTableCellElement>
> = ({ children, className = "", ...props }) => {
  return (
    <th className={`px-6 py-4 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement>
> = ({ children, className = "", ...props }) => {
  return (
    <td className={`px-6 py-4 font-sans align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};
