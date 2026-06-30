import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Report() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all'); // 'all', 'daily', 'weekly'
  const [stockInReports, setStockInReports] = useState([]);
  const [stockOutReports, setStockOutReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const productMap = {};

      // 1. Fata ibicuruzwa byose (Rinda ikosa rya Products API)
      try {
        const prodRes = await fetch('http://localhost:5000/api/products', { headers });
        if (prodRes.ok) {
          const products = await prodRes.json();
          if (Array.isArray(products)) {
            products.forEach(p => {
              const code = p.productcode || p.ProductCode;
              const name = p.productname || p.ProductName;
              productMap[code] = name;
            });
          }
        }
      } catch (err) {
        console.error("Ibibazo muli Products API:", err);
      }

      // 2. Fata amakuru ya Stock In (Kuvura ikosa rya Product In)
      try {
        const inRes = await fetch('http://localhost:5000/api/product-in', { headers });
        if (inRes.ok) {
          const inData = await inRes.json();
          
          // Gufata array yaba ije muryo butaziguye cyangwa wrapped
          const fetchedIn = Array.isArray(inData) 
            ? inData 
            : (inData.productInList || inData.data || []);

          const formattedIn = fetchedIn.map(item => {
            const code = item.ProductCode || item.productcode;
            const qty = Number(item.Quantity || item.quantity || 0);
            const price = Number(item.UniquePrice || item.uniqueprice || 0);
            const total = item.Totalprice || item.totalprice || (qty * price);

            return {
              code: code,
              name: productMap[code] || 'A damaged product',
              date: item.Date || item.date,
              quantity: qty,
              uniquePrice: price,
              totalPrice: Number(total)
            };
          });
          setStockInReports(formattedIn);
        }
      } catch (err) {
        console.error("Questions about Stock In API:", err);
      }

      // 3. Fata amakuru ya Stock Out (Kuvura ikosa rya Product Out)
      try {
        const outRes = await fetch('http://localhost:5000/api/product-out', { headers });
        if (outRes.ok) {
          const outData = await outRes.json();
          
          const fetchedOut = Array.isArray(outData)
            ? outData
            : (outData.productOutList || outData.data || []);

          const formattedOut = fetchedOut.map(item => {
            const code = item.ProductCode || item.productcode;
            const qty = Number(item.Quantity || item.quantity || 0);
            const price = Number(item.UniquePrice || item.uniqueprice || 0);
            const total = item.Totalprice || item.totalprice || (qty * price);

            return {
              code: code,
              name: productMap[code] || 'A damaged product',
              date: item.Date || item.date,
              quantity: qty,
              uniquePrice: price,
              totalPrice: Number(total)
            };
          });
          setStockOutReports(formattedOut);
        }
      } catch (err) {
        console.error("Issues with Stock Out API:", err);
      }

      setLoading(false);
    };

    fetchReportData();
  }, []);

  // Filter Logic
  const filterRecords = (records) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (filterType === 'daily') {
      return records.filter(r => {
        if (!r.date) return false;
        const rDate = new Date(r.date).toISOString().split('T')[0];
        return rDate === today;
      });
    }
    if (filterType === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return records.filter(r => {
        if (!r.date) return false;
        return new Date(r.date) >= sevenDaysAgo;
      });
    }
    return records;
  };

  const filteredIn = filterRecords(stockInReports);
  const filteredOut = filterRecords(stockOutReports);

  const totalMoneyIn = filteredIn.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalMoneyOut = filteredOut.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* NAVBAR */}
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏬</span>
          <span className="text-xl font-black text-blue-400">Berwashop</span>
        </div>
        <div className="flex items-center space-x-6 font-medium text-sm">
          <Link to="/dashboard" className="text-slate-300 hover:text-white transition">📊 Dashboard</Link>
          <Link to="/products" className="text-slate-300 hover:text-white transition">📦 Products</Link>
          <Link to="/product-in" className="text-slate-300 hover:text-white transition">📥 Stock In</Link>
          <Link to="/product-out" className="text-slate-300 hover:text-white transition">📤 Stock Out</Link>
          <Link to="/reports" className="text-blue-400 border-b-2 border-blue-400 pb-1 font-bold">📋 Report</Link>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition">🚪 Logout</button>
      </nav>

      {/* MAIN */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Census and Report Creation (System Audit)</h1>
            <p className="text-gray-500 text-xs mt-0.5">Complete report of all actions taken on Stock In and Stock Out</p>
          </div>
          
          <div className="bg-white border border-gray-200 p-1 rounded-xl shadow-xs flex space-x-1 w-fit h-fit">
            <button onClick={() => setFilterType('all')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${filterType === 'all' ? 'bg-slate-950 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>All (All)</button>
            <button onClick={() => setFilterType('daily')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${filterType === 'daily' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>Daily Report</button>
            <button onClick={() => setFilterType('weekly')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${filterType === 'weekly' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>Weekly Report</button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 bg-gradient-to-br from-white to-emerald-50/20">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Value of Stock In</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{totalMoneyIn.toLocaleString()} <span className="text-sm font-normal text-gray-500">FRW</span></p>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-2 inline-block">💸 Total stock in</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 bg-gradient-to-br from-white to-amber-50/20">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Price of Stock Out (Sales)</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{totalMoneyOut.toLocaleString()} <span className="text-sm font-normal text-gray-500">FRW</span></p>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full mt-2 inline-block">💰 Total stockout</span>
          </div>
        </div>

        {/* TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* STOCK IN TABLE */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-emerald-50 text-emerald-800 font-extrabold text-sm flex items-center space-x-2">
              <span>📥</span> <span>Stock in action (Stock In Actions)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-gray-200">
                    <th className="p-3 pl-4">Date</th>
                    <th className="p-3">Products</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right pr-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {loading ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">find the information...</td></tr>
                  ) : filteredIn.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">there is no action maked on-filter.</td></tr>
                  ) : filteredIn.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 pl-4 font-medium text-gray-500">{item.date ? new Date(item.date).toLocaleDateString('fr-FR') : ''}</td>
                      <td className="p-3 font-bold text-gray-900">{item.name} <span className="text-[10px] font-mono text-blue-500 block">#{item.code}</span></td>
                      <td className="p-3 text-center font-semibold text-emerald-600">+{item.quantity}</td>
                      <td className="p-3 text-right">{item.uniquePrice.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-emerald-700 pr-4">{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* STOCK OUT TABLE */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-amber-50 text-amber-800 font-extrabold text-sm flex items-center space-x-2">
              <span>📤</span> <span>activities stockout (Stock Out Actions)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-gray-200">
                    <th className="p-3 pl-4">Date</th>
                    <th className="p-3">Products</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right pr-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {loading ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">find information...</td></tr>
                  ) : filteredOut.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">there is no action seen on  i-filter.</td></tr>
                  ) : filteredOut.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 pl-4 font-medium text-gray-500">{item.date ? new Date(item.date).toLocaleDateString('fr-FR') : ''}</td>
                      <td className="p-3 font-bold text-gray-900">{item.name} <span className="text-[10px] font-mono text-blue-500 block">#{item.code}</span></td>
                      <td className="p-3 text-center font-semibold text-amber-600">-{item.quantity}</td>
                      <td className="p-3 text-right">{item.uniquePrice.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-amber-600 pr-4">{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Report;