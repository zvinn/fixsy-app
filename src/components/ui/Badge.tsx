

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary';
    icon?: React.ReactNode;
}

/**
 * Badge - Atomic UI Component
 * Used for statuses, tags, and indicators
 */
export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'info',
    icon,
    className = '',
    ...props
}) => {
    const baseClass = 'badge-base';
    const variantClass = `badge-${variant}`;

    return (
        <span
            className={`${baseClass} ${variantClass} ${className}`}
            style={{ gap: icon ? '4px' : '0' }}
            {...props}
        >
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
};
