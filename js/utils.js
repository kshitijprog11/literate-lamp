/**
 * Shared utility functions
 */

// CSV Export Functions
export function convertToCSV(data, fields) {
    const header = fields.join(',');
    const rows = data.map(item =>
        fields.map(field => {
            let value = item[field] || '';
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }
            return value;
        }).join(',')
    );

    return [header, ...rows].join('\n');
}

export function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}