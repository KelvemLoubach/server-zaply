"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const http_status_codes_1 = require("http-status-codes");
const healthCheck = (req, res) => {
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: 'running',
        timestamp: new Date().toISOString()
    });
};
exports.healthCheck = healthCheck;
