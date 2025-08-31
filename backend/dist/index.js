"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const analysis_1 = __importDefault(require("./routes/analysis"));
const coach_1 = __importDefault(require("./routes/coach"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://omni-pass.vercel.app']
    : ['http://localhost:8080'];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
// Development logging
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`🔍 Incoming: ${req.method} ${req.originalUrl}`);
        next();
    });
}
// Security and parsing middleware
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('combined'));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/analysis', analysis_1.default);
app.use('/api/coach', coach_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
// 404 handler
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 OmniPass Backend running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
