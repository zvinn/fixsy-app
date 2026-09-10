

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = true,
    className = '',
    ...props
}) => {
    return (
        <div style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {label && <label style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>{label}</label>}
            <input
                className={`input-base ${error ? 'input-error' : ''} ${className}`}
                {...props}
            />
            {error && <span style={{ fontSize: '0.8rem', color: '#EF4444' }}>{error}</span>}
        </div>
    );
};
