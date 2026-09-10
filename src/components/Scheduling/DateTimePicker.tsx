// src/components/Scheduling/DateTimePicker.tsx

import { Calendar, Clock } from 'lucide-react';

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    min?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
    value,
    onChange,
    label = "Select Date & Time",
    min = new Date().toISOString().slice(0, 16)
}) => {
    const inputId = `datetime-picker-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div style={{ marginBottom: '20px' }}>
            <label
                htmlFor={inputId}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)'
                }}
            >
                <Calendar size={18} color="var(--primary)" aria-hidden="true" /> {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    id={inputId}
                    type="datetime-local"
                    className="form-input"
                    value={value}
                    min={min}
                    onChange={(e) => onChange(e.target.value)}
                    aria-describedby={`${inputId}-hint`}
                    style={{
                        width: '100%',
                        height: '50px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        padding: '0 15px',
                        fontSize: '1rem',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        paddingLeft: '45px'
                    }}
                />
                <Clock
                    size={20}
                    color="var(--text-secondary)"
                    aria-hidden="true"
                    style={{ position: 'absolute', left: '15px', top: '15px', pointerEvents: 'none' }}
                />
            </div>
        </div>
    );
};

export default DateTimePicker;
