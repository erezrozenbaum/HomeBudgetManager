const axios = require('axios');
const Stock = require('../models/stock');
const { OpenAI } = require('openai');

class StockService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.finnhubKey = process.env.FINNHUB_API_KEY;
  }

  async fetchStockData(symbol) {
    try {
      // Fetch basic stock information
      const [quote, companyInfo] = await Promise.all([
        this.fetchStockQuote(symbol),
        this.fetchCompanyInfo(symbol)
      ]);

      // Fetch historical data and news
      const [historicalData, news] = await Promise.all([
        this.fetchHistoricalData(symbol),
        this.fetchStockNews(symbol)
      ]);

      // Calculate technical indicators
      const technicalIndicators = this.calculateTechnicalIndicators(historicalData);

      // Perform AI analysis
      const aiAnalysis = await this.analyzeStock({
        symbol,
        quote,
        companyInfo,
        technicalIndicators,
        news
      });

      return {
        symbol,
        name: companyInfo.name,
        exchange: companyInfo.exchange,
        sector: companyInfo.sector,
        industry: companyInfo.industry,
        currentPrice: quote.currentPrice,
        previousClose: quote.previousClose,
        marketCap: quote.marketCap,
        peRatio: quote.peRatio,
        dividendYield: quote.dividendYield,
        priceHistory: historicalData,
        technicalIndicators,
        news,
        aiAnalysis,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw new Error('Failed to fetch stock data');
    }
  }

  async fetchStockQuote(symbol) {
    try {
      const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubKey}`);
      return {
        currentPrice: response.data.c,
        previousClose: response.data.pc,
        marketCap: response.data.marketCap,
        peRatio: response.data.pe,
        dividendYield: response.data.dividendYield
      };
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw new Error('Failed to fetch stock quote');
    }
  }

  async fetchCompanyInfo(symbol) {
    try {
      const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${this.finnhubKey}`);
      return {
        name: response.data.name,
        exchange: response.data.exchange,
        sector: response.data.finnhubIndustry,
        industry: response.data.industry
      };
    } catch (error) {
      console.error('Error fetching company info:', error);
      throw new Error('Failed to fetch company info');
    }
  }

  async fetchHistoricalData(symbol) {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.alphaVantageKey}`);
      const timeSeries = response.data['Time Series (Daily)'];
      
      return Object.entries(timeSeries).map(([date, data]) => ({
        date: new Date(date),
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'])
      })).sort((a, b) => a.date - b.date);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error('Failed to fetch historical data');
    }
  }

  async fetchStockNews(symbol) {
    try {
      const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}&token=${this.finnhubKey}`);
      
      return response.data.map(article => ({
        date: new Date(article.datetime * 1000),
        title: article.headline,
        source: article.source,
        url: article.url,
        summary: article.summary,
        sentiment: this.analyzeSentiment(article.headline + ' ' + article.summary)
      }));
    } catch (error) {
      console.error('Error fetching stock news:', error);
      throw new Error('Failed to fetch stock news');
    }
  }

  calculateTechnicalIndicators(historicalData) {
    const closes = historicalData.map(d => d.close);
    
    return {
      sma50: this.calculateSMA(closes, 50),
      sma200: this.calculateSMA(closes, 200),
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes)
    };
  }

  calculateSMA(data, period) {
    if (data.length < period) return null;
    const sum = data.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  calculateRSI(data, period = 14) {
    if (data.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = data[i] - data[i - 1];
      if (change >= 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateMACD(data) {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    const macdLine = ema12 - ema26;
    const signalLine = this.calculateEMA([macdLine], 9);
    
    return {
      value: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  }

  calculateEMA(data, period) {
    const k = 2 / (period + 1);
    let ema = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    
    return ema;
  }

  async analyzeStock(data) {
    try {
      const prompt = this.generateAnalysisPrompt(data);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst providing stock analysis and recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return this.parseAIResponse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      throw new Error('Failed to perform AI analysis');
    }
  }

  generateAnalysisPrompt(data) {
    return `
      Analyze the following stock data and provide insights:
      
      Symbol: ${data.symbol}
      Current Price: ${data.quote.currentPrice}
      Previous Close: ${data.quote.previousClose}
      Market Cap: ${data.quote.marketCap}
      P/E Ratio: ${data.quote.peRatio}
      Dividend Yield: ${data.quote.dividendYield}
      
      Technical Indicators:
      - 50-day SMA: ${data.technicalIndicators.sma50}
      - 200-day SMA: ${data.technicalIndicators.sma200}
      - RSI: ${data.technicalIndicators.rsi}
      - MACD: ${JSON.stringify(data.technicalIndicators.macd)}
      
      Recent News Headlines:
      ${data.news.slice(0, 5).map(n => `- ${n.title}`).join('\n')}
      
      Please provide:
      1. Short-term outlook (1-3 months)
      2. Long-term outlook (6-12 months)
      3. Key factors influencing the analysis
      4. Specific recommendations
      5. Confidence level (0-100)
    `;
  }

  parseAIResponse(response) {
    const lines = response.split('\n');
    return {
      shortTermOutlook: this.extractValue(lines, 'Short-term outlook'),
      longTermOutlook: this.extractValue(lines, 'Long-term outlook'),
      keyFactors: this.extractList(lines, 'Key factors'),
      recommendations: this.extractValue(lines, 'Specific recommendations'),
      confidence: parseInt(this.extractValue(lines, 'Confidence level')) || 50
    };
  }

  extractValue(lines, prefix) {
    const line = lines.find(l => l.includes(prefix));
    return line ? line.split(':')[1].trim() : '';
  }

  extractList(lines, prefix) {
    const startIndex = lines.findIndex(l => l.includes(prefix));
    if (startIndex === -1) return [];
    
    const list = [];
    let i = startIndex + 1;
    while (i < lines.length && lines[i].trim().startsWith('-')) {
      list.push(lines[i].trim().substring(1).trim());
      i++;
    }
    
    return list;
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['up', 'rise', 'gain', 'positive', 'bullish', 'growth', 'profit'];
    const negativeWords = ['down', 'fall', 'loss', 'negative', 'bearish', 'decline', 'drop'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  async checkInvestmentOpportunities() {
    try {
      const stocks = await Stock.find().sort({ 'aiAnalysis.confidence': -1 }).limit(10);
      return stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        confidence: stock.aiAnalysis.confidence,
        recommendation: stock.aiAnalysis.recommendations,
        keyFactors: stock.aiAnalysis.keyFactors
      }));
    } catch (error) {
      console.error('Error checking investment opportunities:', error);
      throw new Error('Failed to check investment opportunities');
    }
  }
}

module.exports = new StockService(); 