const axios = require('axios')
const ProductTransaction = require('./models/ProductTransaction.model');
const { route } = require('./routes');

exports.getStatus = (req, res) => {
    res.status(200).json({
        message:"Welcome",
        date: new Date()
    });
}

exports.initializeDatabaseHandler = async (req, res, next) => {

    try{
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

    console.log(data);
   await ProductTransaction.insertMany(data);

    res.status(200).json({
            message: 'Database initialized successfully'
    });
    }catch(error){
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTransactions = async (req, res, next) => {

    try{
        const { month = 3, search = '', page = 1, perPage = 10 } = req.query;
        const skip = (page-1) * perPage; //for 1 10 = 0*10 = 0
                                        //for 2 10 = 2-1*10 = 10 to skip              
        console.log("search", search);
        const parsedPrice = parseFloat(search);
        const priceQuery = isNaN(parsedPrice) ? { price: {$exists:false}} : {price: parsedPrice};
        const query = {
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, parseInt(month)],
            },
            $or: [
                { title: { $regex: new RegExp(search, 'i') } },
                { description: { $regex: new RegExp(search, 'i') } },
                priceQuery,
            ],
        };

        const result = await ProductTransaction.find(query)
        .skip(skip)
        .limit(parseInt(perPage));

        console.log(result);
        return res.status(200).json(result);
    }catch(error){
        console.log("Error fetching transactions:", error);
        res.status(500).json({error: error});
    }
};

exports.getstatistics = async (req, res, next) => {

    try{
        const month = req.query.month || 3;
        const totalSaleAmount = await calculateTotalSaleAmount(month);
        const totalSoldItems = await calculateTotalSoldItems(month);
        const totalNotSoldItems = await calculateTotalNotSoldItems(month);

        return res.status(200).json({
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems,
        });

    }catch(error){
        console.log("Error fetching transactions:", error);
        res.status(500).json({error:error});
    }
};

const calculateTotalSaleAmount = async (month) => {

    const result = await ProductTransaction.aggregate([
        {
            $match: {
                $expr: {
                    $eq: [{ $month: "$dateOfSale" }, month],
                },
            },
        },
        {
            $match: {
                sold: true,
            },
        },
        {
            $group: {
                _id: null,
                totalSaleAmount: { $sum: "$price" },
            },
        },
    ]);
    return result.length>0 ? result[0].totalSaleAmount : 0;
}
const calculateTotalSoldItems = async (month) => {

    const result = await ProductTransaction.aggregate([
        {
            $match: {
                $expr: {
                    $eq: [{ $month: "$dateOfSale" }, month],
                },
                sold: true,
            },
        },
        {
            $group: {
                _id: null,
                totalSoldItems: { $sum: 1 },
            },
        },
    ]);
    
    return result.length > 0 ? result[0].totalSoldItems : 0;
    
}
const calculateTotalNotSoldItems = async (month) => {
    const result = await ProductTransaction.aggregate([
        {
            $match: {
                $expr: {
                    $eq: [{ $month: "$dateOfSale" }, month],
                },
                sold: false,
            },
        },
        {
            $group: {
                _id: null,
                totalNotSoldItems: { $sum: 1 },
            },
        },
    ]);
    
    // If there are results, return the count; otherwise, return 0
    return result.length > 0 ? result[0].totalNotSoldItems : 0;
    
}

exports.getBarChartData = async (req, res, next) => {
    try {
        const month = req.query.month || 3;

        const result = await ProductTransaction.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, month],
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lte: ["$price", 100] }, then: '0 - 100' },
                                { case: { $lte: ["$price", 200] }, then: '101 - 200' },
                                { case: { $lte: ["$price", 200] }, then: '201 - 300' },
                                { case: { $lte: ["$price", 200] }, then: '301 - 400' },
                                { case: { $lte: ["$price", 200] }, then: '401 - 500' },
                                { case: { $lte: ["$price", 200] }, then: '501 - 600' },
                                { case: { $lte: ["$price", 200] }, then: '601 - 700' },
                                { case: { $lte: ["$price", 200] }, then: '701 - 800' },
                                { case: { $lte: ["$price", 200] }, then: '801 - 900' },
                            ],
                            default: '901-above', 
                        },
                    },
                    count: { $sum: 1 },
                },
            },
        ]);

        const response = result.map(item => ({
            priceRange: item._id,
            count: item.count,
        }));

        return res.status(200).json({
            result: response
        });

    } catch (error) {
        console.log("Error fetching records:", error);
            res.status(500).json({ error: error });
    }
}

exports.getPieChartData = async (req, res, next) => {

    try {
        const month = req.query.month || 3;
    
        const result = await ProductTransaction.aggregate([
          {
            $match: {
              $expr: {
                $eq: [{ $month: '$dateOfSale' }, parseInt(month)],
              },
            },
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
        ]);
    
        const pieChartData = result.map((item) => ({
          category: item._id,
          itemCount: item.count,
        }));
    
        return res.status(200).json({ pieChartData });
      } catch (error) {
        console.error('Error fetching pie chart data:', error);
            res.status(500).json({ error: error });
        }
}

exports.combinedData = async (req, res, next) => {

    try{
        const statisticsResponse = await this.getstatistics(req, res, next);
        const barChartDataResponse = await this.getBarChartData(req, res, next);
        const pieChartDataResponse = await this.getPieChartData(req, res, next);

        const combinedResponse = {
            statistics : statisticsResponse,
            barChartData : barChartDataResponse.result,
            pieChartData : pieChartDataResponse.response
        }

        return res.status(200).json({
            combinedResponse
        })

    }catch(error){
        console.error('Error fetching pie chart data:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error });
          }
    }
}