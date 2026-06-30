import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function ProductOut() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [stockOutList, setStockOutList] = useState([]); 

  // Input States (Zahujwe neza na Casing ya Backend)
  const [productCode, setProductCode] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [uniquePrice, setUniquePrice] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 

  // Kubara Total Price mu buryo bwikora
  const totalPrice = quantity && uniquePrice ? (Number(quantity) * Number(uniquePrice)) : 0;

  // ===================== 1. FETCH ALL PRODUCTS & STOCK OUT LIST (SOMA) =====================
  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    
    // Fata dropdown products list
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Handling of rejected goods:", err);
    }

    try {
      const response = await fetch('http://localhost:5000/api/product-out', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.productOutList) {
        setStockOutList(data.productOutList);
      }
    } catch (err) {
      console.error("Stock out report failed.:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ===================== 2. CREATE CYANGWA UPDATE (EMEZA) =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    const url = editingId 
      ? `http://localhost:5000/api/product-out/${editingId}` 
      : 'http://localhost:5000/api/product-out';
    const method = editingId ? 'PUT' : 'POST';

   
    const payload = {
      ProductCode: productCode,
      Date: date,
      Quantity: Number(quantity),
      UniquePrice: Number(uniquePrice),
      Totalprice: totalPrice
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingId ? 'Updated news in Stocks!' : 'Stock Out information is well maintained.!');
        clearForm();
        fetchInitialData(); // Refresh list to get new totals
      } else {
       
        setError(data.message || 'There was a problem storing the data.!');
      }
    } catch (err) {
      setError('The server is not available.!');
    } finally {
      setLoading(false);
    }
  };

  // ===================== 3. DELETE (GUSIBA) =====================
  const handleDelete = async (id) => {
    if (!window.confirm('Do you want to permanently delete this Stock Out record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/product-out/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('The record was successfully deleted.!');
        fetchInitialData();
        if (editingId === id) clearForm();
      } else {
        setError('This record could not be deleted..');
      }
    } catch (err) {
      setError('Network problem in deletion!');
    }
  };

  // ===================== 4. SETUP EDIT (GUHINDURA) =====================
  const startEdit = (row) => {
    setEditingId(row.id);
    setProductCode(row.ProductCode);
    if (row.Date) setDate(new Date(row.Date).toISOString().split('T')[0]);
    setQuantity(row.Quantity);
    setUniquePrice(row.UniquePrice);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const clearForm = () => {
    setEditingId(null);
    setProductCode('');
    setDate(new Date().toISOString().split('T')[0]);
    setQuantity('');
    setUniquePrice('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOP NAVBAR */}
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏬</span>
          <span className="text-xl font-black text-blue-400">Berwashop</span>
        </div>
        <div className="flex items-center space-x-6 font-medium text-sm">
          <Link to="/dashboard" className="text-slate-300 hover:text-white">📊 Dashboard</Link>
          <Link to="/products" className="text-slate-300 hover:text-white">📦 products</Link>
          <Link to="/product-in" className="text-slate-300 hover:text-white">📥 Stock In</Link>
          <Link to="/product-out" className="text-blue-400 border-b-2 border-blue-400 pb-1 font-bold">📤 Stock Out</Link>
          <Link to="/reports" className="text-slate-300 hover:text-white">📋 Report</Link>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg">🚪 Logout</button>
      </nav>

      {/* MAIN BODY GRID */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FOMU YO KWINJIZA CYANGWA GUHINDURA */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
          <h3 className={`text-lg font-black mb-1 flex items-center space-x-2 ${editingId ? 'text-amber-500' : 'text-amber-600'}`}>
            <span>📤</span> <span>{editingId ? 'Change Stock Out' : 'Stock out (Stock Out)'}</span>
          </h3>
          <p className="text-gray-500 text-xs mb-6">Record products purchased or released from the warehouse..</p>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold mb-4">⚠️ {error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-semibold mb-4">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Choose a product</label>
              <select value={productCode} onChange={(e) => setProductCode(e.target.value)} required
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm bg-white font-semibold">
                <option value="">-- Choose here --</option>
                {products.map((p, i) => {
                  const pCode = p.productcode || p.ProductCode;
                  const pName = p.productname || p.ProductName;
                  return (
                    <option key={i} value={pCode}>{pName} ({pCode})</option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Date (Date)</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm font-semibold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Quantity (Qty)</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required placeholder="10"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">price (Price)</label>
                <input type="number" min="0" value={uniquePrice} onChange={(e) => setUniquePrice(e.target.value)} required placeholder="6000"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex justify-between items-center">
              <span className="text-xs font-bold text-amber-800 uppercase">Total Sales:</span>
              <span className="text-base font-black text-amber-700">{totalPrice.toLocaleString()} FRW</span>
            </div>

            <div className="flex space-x-2">
              <button type="submit" disabled={loading}
                className={`flex-1 text-white font-bold py-2.5 rounded-lg text-sm transition ${
                  editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-600 hover:bg-amber-700'
                }`}>
                {loading ? 'Iri kubika...' : editingId ? 'update (Update)' : 'Emeza Stock Out'}
              </button>
              {editingId && (
                <button type="button" onClick={clearForm} className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 rounded-lg text-sm">
                  Kurafe
                </button>
              )}
            </div>
          </form>
        </div>

        {/* IMBONERAHAMWE Y'IBYASOHOTSE (TABLE OUTPUT) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-extrabold text-gray-800 text-sm">📋 Publication Report / List</h3>
            <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full">{stockOutList.length} Records</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-gray-200">
                  <th className="p-4 pl-6">Product Code</th>
                  <th className="p-4">Itariki</th>
                  <th className="p-4 text-center">Quantity</th>
                  <th className="p-4 text-right">price</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center pr-6">activities</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-100">
                {stockOutList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">No products are being removed from the warehouse.</td>
                  </tr>
                ) : (
                  stockOutList.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 pl-6 font-mono font-bold text-blue-600">{row.ProductCode}</td>
                      <td className="p-4 font-medium">{new Date(row.Date).toLocaleDateString('fr-FR')}</td>
                      <td className="p-4 text-center font-bold text-gray-900">{row.Quantity}</td>
                      <td className="p-4 text-right">{Number(row.UniquePrice).toLocaleString()} FRW</td>
                      <td className="p-4 text-right font-black text-amber-600">{Number(row.Totalprice).toLocaleString()} FRW</td>
                      <td className="p-4 text-center pr-6 space-x-1.5 whitespace-nowrap">
                        <button onClick={() => startEdit(row)} className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">✏️ Edit</button>
                        <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">🗑️ Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

export default ProductOut;