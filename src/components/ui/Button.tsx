

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning' | 'info';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = 'btn-base';
    const variantClass = `btn-${variant}`;
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';
    const fullClass = fullWidth ? 'btn-full' : '';
    const widthStyle = fullWidth ? { width: '100%' } : {};

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${fullClass} ${className}`.trim()}
            style={{ ...widthStyle }}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <span className="animate-spin">⌛</span> : icon}
            {children}
        </button>
    );
};
