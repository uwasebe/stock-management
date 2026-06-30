import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function ProductIn() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]); 
  const [stockInList, setStockInList] = useState([]); 
  const [productCode, setProductCode] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [quantity, setQuantity] = useState('');
  const [uniquePrice, setUniquePrice] = useState('');
  
  // CRUD States
  const [editingId, setEditingId] = useState(null); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPrice = quantity && uniquePrice ? (Number(quantity) * Number(uniquePrice)) : 0;

  // 1. READ: Gufata amakuru yose kuva muli Backend
  const loadAllData = async () => {
    const token = localStorage.getItem('token');
    
    
    try {
      const resProducts = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resProducts.ok) {
        const dataProd = await resProducts.json();
        setProducts(Array.isArray(dataProd) ? dataProd : []);
      }
    } catch (err) {
      console.error("error for insert product:", err);
    }

    // Fata stock_in list
    try {
      const resStockIn = await fetch('http://localhost:5000/api/product-in', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resStockIn.ok) {
        const dataStock = await resStockIn.json();
        
        if (dataStock && dataStock.productInList) {
          setStockInList(dataStock.productInList);
        } else if (Array.isArray(dataStock)) {
          setStockInList(dataStock);
        } else {
          setStockInList([]);
        }
      }
    } catch (err) {
      console.error("Problems in capturing Product In data:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 2. CREATE & UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    
    const payload = {
      productcode: productCode,
      ProductCode: productCode,
      date: date,
      Date: date,
      quantity: Number(quantity),
      Quantity: Number(quantity),
      uniqueprice: Number(uniquePrice),
      UniquePrice: Number(uniquePrice),
      totalprice: totalPrice,
      Totalprice: totalPrice
    };

    try {
      let response;
      if (editingId) {
        response = await fetch(`http://localhost:5000/api/product-in/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:5000/api/product-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingId ? 'News updated successfully in Stock!' : 'News saved successfully in Stock!');
        setProductCode('');
        setQuantity('');
        setUniquePrice('');
        setEditingId(null);
        loadAllData(); 
      } else {
        setError(data.message || 'A problem has arisen.!');
      }
    } catch (err) {
      setError('The server is not available.!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    const id = item.id || item.ID;
    setEditingId(id);
    setProductCode(item.ProductCode || item.productcode || '');
    
    const rawDate = item.Date || item.date;
    if (rawDate) {
      setDate(new Date(rawDate).toISOString().split('T')[0]);
    }
    setQuantity(item.Quantity || item.quantity || '');
    setUniquePrice(item.UniquePrice || item.uniqueprice || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this information?")) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/product-in/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('The information has been successfully deleted from the archive!');
        loadAllData();
      } else {
        setError('Delete denied!');
      }
    } catch (err) {
      setError('There is a problem with the server.!');
    }
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
          <Link to="/products" className="text-slate-300 hover:text-white">📦 Products</Link>
          <Link to="/product-in" className="text-blue-400 border-b-2 border-blue-400 pb-1 font-bold">📥 Stock In</Link>
          <Link to="/product-out" className="text-slate-300 hover:text-white">📤 Stock Out</Link>
          <Link to="/reports" className="text-slate-300 hover:text-white">📋 Report</Link>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg">🚪 Logout</button>
      </nav>

      {/* MAIN CONTENT GRID */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FOMU YO KWINJIZA / GUHINDURA */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-150 h-fit">
          <h3 className="text-lg font-black text-gray-800 mb-1 flex items-center space-x-2 text-emerald-600">
            <span>📥</span> <span>{editingId ? 'change in the stock ' : 'Stockin'}</span>
          </h3>
          <p className="text-gray-500 text-xs mb-6">Enter the goods that have arrived in the warehouse.</p>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-semibold mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Choose a product</label>
              <select value={productCode} onChange={(e) => setProductCode(e.target.value)} required
                className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm bg-white font-semibold">
                <option value="">-- Choose on here --</option>
                {products.map((p, i) => {
                  // Ifata 
                  const pCode = p.productcode || p.ProductCode;
                  const pName = p.productname || p.ProductName;
                  return (
                    <option key={i} value={pCode}>
                      {pCode} - {pName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Date (Date)</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Quantity (Qty)</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required placeholder="50"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Price (Price)</label>
                <input type="number" min="0" value={uniquePrice} onChange={(e) => setUniquePrice(e.target.value)} required placeholder="5000"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-800 uppercase">Total Price:</span>
              <span className="text-base font-black text-emerald-700">{totalPrice.toLocaleString()} FRW</span>
            </div>

            <div className="flex space-x-2">
              <button type="submit" disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 rounded-lg text-sm transition">
                {loading ? 'Iri kubika...' : editingId ? 'Update (Update)' : 'Confirm Login'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setProductCode(''); setQuantity(''); setUniquePrice(''); }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-3 py-2.5 rounded-lg text-sm transition">
                  Kurafe
                </button>
              )}
            </div>
          </form>
        </div>

        {/* OUTPUT TABLE: LIST OF STOCK IN */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-extrabold text-gray-800 text-sm flex items-center space-x-2">
              <span>📋</span> <span>Stock Information</span>
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
              {stockInList.length} Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-gray-200">
                  <th className="p-3 pl-4">Product Code</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Price per unit</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center pr-4">Program</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {stockInList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-400 font-medium">No products are listed in Stock In..</td>
                  </tr>
                ) : (
                  stockInList.map((item, i) => {
                    const id = item.id || item.ID;
                    const code = item.ProductCode || item.productcode;
                    const itemDate = item.Date || item.date;
                    const qty = item.Quantity || item.quantity;
                    const price = item.UniquePrice || item.uniqueprice;
                    const total = item.Totalprice || item.totalprice;

                    return (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 pl-4 font-mono font-bold text-blue-600">{code}</td>
                        <td className="p-3 text-gray-500">{itemDate ? new Date(itemDate).toLocaleDateString('fr-FR') : ''}</td>
                        <td className="p-3 text-center font-bold text-gray-900">{qty}</td>
                        <td className="p-3 text-right">{Number(price || 0).toLocaleString()} FRW</td>
                        <td className="p-3 text-right font-black text-emerald-600">{Number(total || 0).toLocaleString()} FRW</td>
                        <td className="p-3 text-center pr-4 space-x-1.5 whitespace-nowrap">
                          <button onClick={() => handleEditClick(item)} className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(id)} className="text-red-600 hover:text-red-800 font-bold bg-red-50 px-2 py-1 rounded">
                            🗑️ Del
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

export default ProductIn;