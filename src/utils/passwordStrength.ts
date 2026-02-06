export const getPasswordStrength = (password: string): { level: number; label: string } => {
    if (password.length === 0) return { level: 0, label: '' };
    if (password.length < 6) return { level: 1, label: 'Debole' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Debole' };
    if (score === 2) return { level: 2, label: 'Media' };
    if (score === 3) return { level: 3, label: 'Buona' };
    return { level: 4, label: 'Forte' };
};

export const STRENGTH_CLASSES = ['', 'weak', 'fair', 'good', 'strong'];
