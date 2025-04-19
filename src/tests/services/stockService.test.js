const { StockService } = require('../../main/services/stockService');
const { Stock } = require('../../main/models/stock');
const { NotFoundError } = require('../../main/middleware/errorHandler');

describe('StockService', () => {
  let stockService;

  beforeEach(() => {
    stockService = new StockService();
  });

  describe('fetchStockData', () => {
    it('should fetch and save stock data', async () => {
      const symbol = 'AAPL';
      const mockStockData = {
        symbol,
        name: 'Apple Inc.',
        currentPrice: 150.00,
        marketCap: 2500000000000
      };

      // Mock API responses
      jest.spyOn(stockService, 'fetchStockQuote').mockResolvedValue(mockStockData);
      jest.spyOn(stockService, 'fetchCompanyInfo').mockResolvedValue({
        name: 'Apple Inc.',
        sector: 'Technology'
      });
      jest.spyOn(stockService, 'fetchHistoricalData').mockResolvedValue([]);
      jest.spyOn(stockService, 'fetchStockNews').mockResolvedValue([]);
      jest.spyOn(stockService, 'analyzeStock').mockResolvedValue({
        shortTermOutlook: 'bullish',
        longTermOutlook: 'bullish',
        confidence: 85
      });

      const result = await stockService.fetchStockData(symbol);

      expect(result.symbol).toBe(symbol);
      expect(result.name).toBe('Apple Inc.');
      expect(result.currentPrice).toBe(150.00);
      expect(result.marketCap).toBe(2500000000000);
    });

    it('should throw error for invalid symbol', async () => {
      const symbol = 'INVALID';
      
      jest.spyOn(stockService, 'fetchStockQuote').mockRejectedValue(new Error('Stock not found'));

      await expect(stockService.fetchStockData(symbol)).rejects.toThrow('Stock not found');
    });
  });

  describe('calculateTechnicalIndicators', () => {
    it('should calculate technical indicators correctly', () => {
      const historicalData = [
        { close: 100 },
        { close: 105 },
        { close: 110 },
        { close: 115 },
        { close: 120 }
      ];

      const indicators = stockService.calculateTechnicalIndicators(historicalData);

      expect(indicators.sma50).toBeDefined();
      expect(indicators.sma200).toBeDefined();
      expect(indicators.rsi).toBeDefined();
      expect(indicators.macd).toBeDefined();
    });

    it('should handle empty historical data', () => {
      const indicators = stockService.calculateTechnicalIndicators([]);

      expect(indicators.sma50).toBeNull();
      expect(indicators.sma200).toBeNull();
      expect(indicators.rsi).toBeNull();
      expect(indicators.macd).toBeNull();
    });
  });

  describe('checkInvestmentOpportunities', () => {
    it('should return investment opportunities based on alerts', async () => {
      const mockStocks = [
        {
          symbol: 'AAPL',
          currentPrice: 150,
          alerts: [
            {
              type: 'price',
              condition: 'below',
              value: 160,
              message: 'Price below target'
            }
          ]
        }
      ];

      jest.spyOn(Stock, 'find').mockResolvedValue(mockStocks);

      const opportunities = await stockService.checkInvestmentOpportunities();

      expect(opportunities).toHaveLength(1);
      expect(opportunities[0].symbol).toBe('AAPL');
      expect(opportunities[0].alerts).toHaveLength(1);
    });

    it('should return empty array when no opportunities found', async () => {
      jest.spyOn(Stock, 'find').mockResolvedValue([]);

      const opportunities = await stockService.checkInvestmentOpportunities();

      expect(opportunities).toHaveLength(0);
    });
  });
}); 