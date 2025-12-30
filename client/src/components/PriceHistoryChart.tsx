import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceDataPoint {
  date: string;
  tcgplayer?: number;
  cardmarket?: number;
  yuyutei?: number;
}

interface PriceHistoryChartProps {
  cardId: string;
}

export default function PriceHistoryChart({ cardId }: PriceHistoryChartProps) {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call to get price history
    // For now, generating mock data
    generateMockPriceData();
  }, [cardId]);

  const generateMockPriceData = () => {
    // Mock data - in real implementation, fetch from /api/cards/:id/price-history
    const data: PriceDataPoint[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 50);

    for (let i = 0; i < 50; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tcgplayer: 0.15 + (Math.random() * 0.1) - 0.05,
        cardmarket: 0.10 + (Math.random() * 0.08) - 0.04,
      });
    }

    setPriceData(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading price history...</div>;
  }

  return (
    <div className="price-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={priceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            domain={[0, 'dataMax + 0.1']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #d0d0d0',
              borderRadius: '4px'
            }}
          />
          <Legend />
          {priceData.some(d => d.tcgplayer !== undefined) && (
            <Line 
              type="monotone" 
              dataKey="tcgplayer" 
              stroke="#0088FE" 
              strokeWidth={2}
              name="TCGplayer"
              dot={false}
            />
          )}
          {priceData.some(d => d.cardmarket !== undefined) && (
            <Line 
              type="monotone" 
              dataKey="cardmarket" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Cardmarket"
              dot={false}
            />
          )}
          {priceData.some(d => d.yuyutei !== undefined) && (
            <Line 
              type="monotone" 
              dataKey="yuyutei" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Yuyu-tei"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

