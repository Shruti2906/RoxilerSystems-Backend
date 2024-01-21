const { validationResult, query } = require('express-validator');

exports.validateGetTransactions = [
    query('month').optional().isInt({ min: 1, max: 12 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('perPage').optional().isInt({ min: 1 }).toInt(),
    query('search').optional().isString().trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.validateGetStatistics = [
    query('month').optional().isInt({ min: 1, max: 12 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.validateBarChartData = [
    query('month').optional().isInt({ min: 1, max: 12 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

