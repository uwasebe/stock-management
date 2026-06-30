import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [stockStatus, setStockStatus] = useState([]);
  const [totals, setTotals] = useState({ totalIn: 0, totalOut: 0, availableItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Gufata amakuru y'umucuruzi winjiye mu bubiko bwa Browser
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    } else {
      navigate('/login');
      return; 
    }

    // 2. Guhamagara amakuru y'Ibarura Nyakuri (Fetch data kuva muri Backend API)
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        let fetchedProducts = [];
        let fetchedOut = [];
        let fetchedIn = [];

        // Fata ibicuruzwa byose 
        try {
          const prodRes = await fetch('http://localhost:5000/api/products', { headers });
          if (prodRes.ok) {
            const productsData = await prodRes.json();
            fetchedProducts = Array.isArray(productsData) ? productsData : [];
          }
        } catch (e) { console.error("Error fetching products:", e); }

        // Fata ibyasohotse byose (Product Out)
        try {
          const outRes = await fetch('http://localhost:5000/api/product-out', { headers });
          if (outRes.ok) {
            const outData = await outRes.json();
            fetchedOut = outData.productOutList || (Array.isArray(outData) ? outData : []);
          }
        } catch (e) { console.error("Error fetching product-out:", e); }

        // Fata ibyinjiye byose (Product In)
        try {
          const inRes = await fetch('http://localhost:5000/api/product-in', { headers });
          if (inRes.ok) {
            const inData = await inRes.json();
            // HAKOSOWE: Kwemera niba inData ari Array muryo butaziguye cyangwa muri object wrapping
            fetchedIn = Array.isArray(inData) 
              ? inData 
              : (inData.productInList || inData.data || []);
          }
        } catch (e) { console.error("Error fetching product-in:", e); }

        // Kubara ibigize buri gicuruzwa (Calculate metrics dynamically per product)
        const liveStock = fetchedProducts.map(prod => {
          const code = prod.productcode || prod.ProductCode;
          const name = prod.productname || prod.ProductName;

          // Igiteranyo cy'ibiheruka kwinjira kuri iyi code
          const totalIn = fetchedIn
            .filter(item => (item.ProductCode || item.productcode) === code)
            .reduce((sum, item) => sum + Number(item.Quantity || item.quantity || 0), 0);

          // Igiteranyo cy'ibiheruka gusohoka kuri iyi code
          const totalOut = fetchedOut
            .filter(item => (item.ProductCode || item.productcode) === code)
            .reduce((sum, item) => sum + Number(item.Quantity || item.quantity || 0), 0);

          const balance = totalIn - totalOut;

          return { code, name, totalIn, totalOut, balance };
        });

        setStockStatus(liveStock);

        // Kubara igiteranyo rusange (Aggregations)
        let tIn = 0, tOut = 0, bal = 0;
        liveStock.forEach(item => {
          tIn += item.totalIn;
          tOut += item.totalOut;
          bal += item.balance;
        });

        setTotals({ totalIn: tIn, totalOut: tOut, availableItems: bal });

      } catch (err) {
        console.error("Dashboard data retrieval failed.:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* ==================== 1. SIDEBAR NAVIGATION ==================== */}
      <div className="w-64 bg-slate-900 text-white flex flex-col justify-between p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 px-2 py-4 mb-6">
            <span className="text-3xl">🏬</span>
            <h2 className="text-2xl font-black tracking-wider text-blue-400">Berwashop</h2>
          </div>
          
          <nav className="space-y-2">
            <Link to="/dashboard" className="flex items-center space-x-3 p-3 bg-blue-600 rounded-lg font-bold shadow-md transition">
              <span>📊</span> <span>Dashboard</span>
            </Link>
            <Link to="/products" className="flex items-center space-x-3 p-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition">
              <span>📦</span> <span> Products</span>
            </Link>
            <Link to="/product-in" className="flex items-center space-x-3 p-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition">
              <span>📥</span> <span>Stock In</span>
            </Link>
            <Link to="/product-out" className="flex items-center space-x-3 p-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition">
              <span>📤</span> <span>Stock Out </span>
            </Link>
            <Link to="/reports" className="flex items-center space-x-3 p-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition">
              <span>📋</span> <span>Reports</span>
            </Link>
          </nav>
        </div>

        {/* Umucuruzi Winjiye n'Aho Gusohokera */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center space-x-3 px-2 mb-4">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white uppercase">
              {user.username ? user.username[0] : 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none mb-1">{user.username}</p>
              <span className="text-xs text-blue-400 capitalize bg-blue-950 px-2 py-0.5 rounded-full font-mono">{user.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold p-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition shadow-md">
            <span>🚪</span> <span>Sohoka (Logout)</span>
          </button>
        </div>
      </div>

      {/* ==================== 2. MAIN CONTENT AREA ==================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Overview Dashboard</h1>
            <p className="text-gray-500 text-xs mt-0.5">Complete information about the Berwashop store</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 shadow-inner">
              📅 {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>
        </header>

        {/* Dashboard Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* ==================== STATS CARDS ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Card 1: Stock In */}
            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Collection of Scriptures</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{totals.totalIn} <span className="text-sm font-normal text-gray-500">Pcs</span></p>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium mt-2 inline-block">📥 Stock In Total</span>
              </div>
              <div className="text-4xl bg-emerald-50 p-3 rounded-xl">📈</div>
            </div>

            {/* Card 2: Stock Out */}
            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total StockOut</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{totals.totalOut} <span className="text-sm font-normal text-gray-500">Pcs</span></p>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium mt-2 inline-block">📤 Stock Out Total</span>
              </div>
              <div className="text-4xl bg-amber-50 p-3 rounded-xl">📉</div>
            </div>

            {/* Card 3: Stock Status Balance */}
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600 flex items-center justify-between bg-gradient-to-br from-white to-blue-50/20">
              <div>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">What's left in the archive</p>
                <p className="text-3xl font-black text-blue-900 mt-1">{totals.availableItems} <span className="text-sm font-normal text-gray-500">Pcs</span></p>
                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold mt-2 inline-block">🛡️ Census Security</span>
              </div>
              <div className="text-4xl bg-blue-100 p-3 rounded-xl">📦</div>
            </div>

          </div>

          {/* ==================== STOCK TABLE ==================== */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-gray-800 tracking-tight flex items-center space-x-2">
                <span>📋</span> <span>Product Appearance and Size Details</span>
              </h3>
              <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-md shadow-2xs">
                Information Security: 100% Secure
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-gray-200 tracking-wider">
                    <th className="p-4 pl-6">Product Code</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4 text-emerald-600">It's in (In)</th>
                    <th className="p-4 text-amber-600">It's out (Out)</th>
                    <th className="p-4 text-blue-600">The rest (Balance)</th>
                    <th className="p-4 pr-6">Team/Method</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">It is looking for information...</td>
                    </tr>
                  ) : stockStatus.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">No products are listed in the database.</td>
                    </tr>
                  ) : stockStatus.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition duration-150">
                      <td className="p-4 pl-6 font-mono font-bold text-xs text-slate-500">{item.code}</td>
                      <td className="p-4 font-bold text-gray-900">{item.name}</td>
                      <td className="p-4 text-emerald-600 font-bold">+{item.totalIn}</td>
                      <td className="p-4 text-amber-600 font-bold">-{item.totalOut}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-tight ${
                          item.balance > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.balance} Pcs
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        {item.balance <= 10 ? (
                          <span className="text-xs font-bold text-red-500 flex items-center space-x-1">
                            <span>⚠️</span> <span>Buy more soon!</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600 flex items-center space-x-1">
                            <span>✅</span> <span>That's enough</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;