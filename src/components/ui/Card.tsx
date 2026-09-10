

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    hover = false,
    children,
    className = '',
    ...props
}) => {
    const baseClass = 'card-base';
    const variantClass = `card-${variant}`;
    const hoverClass = hover ? 'card-hover' : '';

    return (
        <div
            className={`${baseClass} ${variantClass} ${hoverClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
