import { styleText } from 'node:util';

// Status family lookup map (2xx, 3xx, 4xx, 5xx)
const STATUS_COLORS = {
    2: 'green',
    3: 'cyan',
    4: 'yellow',
    5: 'red',
};

// Configured for 12-hour format with AM/PM
const dtf = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
});

function formatTimestamp() {
    const parts = Object.fromEntries(
        dtf.formatToParts(new Date()).map(p => [p.type, p.value])
    );

    // Output format: [23/Sep/2026 03:13:25 AM]
    return `[${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}:${parts.second} ${parts.dayPeriod}]`;
}

function colorStatus(status) {
    const family = Math.floor(status / 100);
    const color = STATUS_COLORS[family];
    return color ? styleText(color, String(status)) : String(status);
}

export default function requestLogger(req, res, next) {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const durationNs = process.hrtime.bigint() - start;
        const durationMs = (Number(durationNs) / 1e6).toFixed(2);
        const size = res.getHeader('content-length') || 0;

        const datePart = styleText('dim', formatTimestamp());
        const methodPart = styleText('cyan', req.method);
        const requestPart = `"${methodPart} ${req.originalUrl}"`;
        const statusPart = colorStatus(res.statusCode);
        const sizePart = styleText('dim', String(size));
        const timePart = styleText('magenta', `${durationMs}ms`);

        console.log(`${datePart} ${requestPart} ${statusPart} ${sizePart} ${timePart}`);
    });

    next();
}
