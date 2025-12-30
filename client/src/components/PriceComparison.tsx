import type { Card } from '../types';

interface PriceComparisonProps {
  card: Card;
  prices: any;
}

export default function PriceComparison({ card, prices }: PriceComparisonProps) {
  const priceRows = [];

  // TCGPlayer prices
  if (prices.tcgplayer) {
    priceRows.push({
      print: 'Standard',
      source: 'TCGplayer',
      usd: prices.tcgplayer.market || prices.tcgplayer.mid || 'N/A',
      eur: 'N/A',
    });
    
    if (prices.tcgplayer.alternativePrint) {
      priceRows.push({
        print: 'Alternative Print',
        source: 'TCGplayer',
        usd: prices.tcgplayer.alternativePrint.market || 'N/A',
        eur: 'N/A',
      });
    }
  }

  // Cardmarket prices
  if (prices.cardmarket) {
    priceRows.push({
      print: 'Standard',
      source: 'Cardmarket',
      usd: 'N/A',
      eur: prices.cardmarket.averagePrice || prices.cardmarket.lowPrice || 'N/A',
    });
  }

  // Yuyu-tei prices
  if (prices.yuyutei) {
    priceRows.push({
      print: 'Standard',
      source: 'Yuyu-tei',
      usd: convertJPYtoUSD(prices.yuyutei.price),
      eur: convertJPYtoEUR(prices.yuyutei.price),
    });
  }

  if (priceRows.length === 0) {
    return (
      <div className="price-comparison">
        <h3>Pricing</h3>
        <p>No pricing data available</p>
      </div>
    );
  }

  return (
    <div className="price-comparison">
      <div className="price-box">
        <div className="price-box-header">
          <h3>{card.pack?.title || 'Card Pack'}</h3>
          <span className="price-box-type">{card.card_type}</span>
        </div>
        <table className="price-table">
          <thead>
            <tr>
              <th>PRINT</th>
              <th>USD</th>
              <th>EUR</th>
            </tr>
          </thead>
          <tbody>
            {priceRows.map((row, index) => (
              <tr key={index}>
                <td>{row.print}</td>
                <td>{typeof row.usd === 'number' ? `$${row.usd.toFixed(2)}` : row.usd}</td>
                <td>{typeof row.eur === 'number' ? `€${row.eur.toFixed(2)}` : row.eur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function convertJPYtoUSD(jpy: number): string {
  // Approximate conversion (should use real-time rates in production)
  const rate = 0.0067; // 1 JPY = 0.0067 USD
  return (jpy * rate).toFixed(2);
}

function convertJPYtoEUR(jpy: number): string {
  // Approximate conversion (should use real-time rates in production)
  const rate = 0.0062; // 1 JPY = 0.0062 EUR
  return (jpy * rate).toFixed(2);
}

