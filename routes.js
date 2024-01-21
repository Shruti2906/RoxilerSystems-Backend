const express = require('express')
const router = express.Router();
const {getStatus, initializeDatabaseHandler, getTransactions, getstatistics, getBarChartData, getPieChartData, combinedData} = require('./controller')
const {validateGetTransactions, validateGetStatistics, validateBarChartData} = require('./middlewares/validationMiddleware')

router.get('/', getStatus);
router.get('/initializeDatabase', initializeDatabaseHandler)
router.get('/getTransactions',validateGetTransactions, getTransactions)
router.get('/getstatistics',validateGetStatistics, getstatistics)
router.get('/getBarChartData',validateBarChartData, getBarChartData);
router.get('/getPieChartData',validateBarChartData, getPieChartData);
router.get('/combinedData', combinedData)

module.exports = router;