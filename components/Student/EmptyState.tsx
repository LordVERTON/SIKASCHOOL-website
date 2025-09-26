interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  const defaultIcon = (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400">
      <path d="M9 12l2 2 4-4" />
      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
      <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
      <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3" />
    </svg>
  );

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-waterloo dark:text-manatee mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <div>
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              <span>{action.label}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
              </svg>
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              <span>{action.label}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
