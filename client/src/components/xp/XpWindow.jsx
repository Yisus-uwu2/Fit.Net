import React from 'react';

export default function XpWindow({
  title,
  icon,
  children,
  className = '',
  headerAction
}) {

  return (
    <div className={`app-panel rounded-2xl overflow-hidden flex flex-col transition-all duration-200 shadow-sm w-full max-w-6xl mx-auto ${className}`}>
      {/* Barra de Título */}
      <div className="px-6 py-3.5 flex items-center justify-between select-none border-b border-[var(--border-color)] bg-[var(--bg-header)]">
        <div className="flex items-center space-x-2.5">
          {icon && <span className="text-blue-600 dark:text-blue-400 flex items-center">{icon}</span>}
          <span className="text-[var(--text-primary)] font-extrabold text-xs uppercase tracking-wider truncate">
            {title}
          </span>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center space-x-3">
          {headerAction}
        </div>
      </div>

      {/* Cuerpo Principal */}
      <div className="p-6 sm:p-7 overflow-x-hidden text-[var(--text-primary)] flex-1 bg-[var(--bg-surface)]">
        {children}
      </div>
    </div>
  );
}
