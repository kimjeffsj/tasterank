interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">
        {icon}
      </span>
      <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      {description && (
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
