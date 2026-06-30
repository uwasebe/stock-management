import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Product() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 

  // ===================== 1. SOMA (READ ALL PRODUCTS) =====================
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setProducts(Array.isArray(data) ? data : []);
      } else {
        // IBI BIHITE BITUBWIRA ICYO BACKEND YAPFUYE:
        setError(`Backend Error: ${data.message || 'Error 500 mu gushaka ibicuruzwa'}`);
      }
    } catch (err) {
      setError('Server ntiri kuboneka!');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ===================== 2. (CREATE & UPDATE) =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    const url = editingId 
      ? `http://localhost:5000/api/products/${editingId}` 
      : 'http://localhost:5000/api/products';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productcode: productCode, 
          productname: productName,
          description: description,
          price: Number(price)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingId ? 'the product updated!' : 'the product inserted well!');
        clearForm();
        fetchProducts();
      } else {
        setError(data.message || 'there is an error in backend!');
      }
    } catch (err) {
      setError('The server is not available.!');
    } finally {
      setLoading(false);
    }
  };

  // ===================== 3. SIBA (DELETE A PRODUCT) =====================
  const handleDelete = async (id) => {
    if (!window.confirm('Do you want to permanently delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('product inserted well!');
        fetchProducts();
        if (editingId === id) clearForm();
      } else {
        setError('This product cannot be deleted.');
      }
    } catch (err) {
      setError('The problem with the network is that it is being deleted.!');
    }
  };

  const startEdit = (prod) => {
    
    const currentId = prod.productcode || prod.ProductCode || prod.id || prod.ID;
    setEditingId(currentId);
    setProductCode(prod.productcode || prod.ProductCode || '');
    setProductName(prod.productname || prod.ProductName || '');
    setDescription(prod.description || prod.Description || '');
    setPrice(prod.price !== undefined ? prod.price : prod.Price || '');
  };

  const clearForm = () => {
    setEditingId(null);
    setProductCode('');
    setProductName('');
    setDescription('');
    setPrice('');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏬</span>
          <span className="text-xl font-black text-blue-400">Berwashop</span>
        </div>
        <div className="flex items-center space-x-6 font-medium text-sm">
          <Link to="/dashboard" className="text-slate-300 hover:text-white">📊 Dashboard</Link>
          <Link to="/products" className="text-blue-400 border-b-2 border-blue-400 pb-1 font-bold">📦 Products</Link>
          <Link to="/product-in" className="text-slate-300 hover:text-white">📥 Stock In</Link>
          <Link to="/product-out" className="text-slate-300 hover:text-white">📤 Stock Out</Link>
          <Link to="/reports" className="text-slate-300 hover:text-white">📋 Report</Link>
        </div>
        <button onClick={handleLogout} className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg">🚪 Logout</button>
      </nav>

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit">
          <h3 className="text-lg font-black text-gray-800 mb-1 flex items-center space-x-2">
            <span>{editingId ? '📝' : '➕'}</span> 
            <span>{editingId ? 'Update Product' : 'Enter New Product'}</span>
          </h3>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold mb-4">⚠️ {error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-semibold mb-4">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Product Code</label>
              <input type="text" value={productCode} onChange={(e) => setProductCode(e.target.value)} required 
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Product Name</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required 
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="2" className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Base Price (FRW)</label>
              <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm font-semibold" />
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm">
                {loading ? 'Iri kubika...' : 'Bika Igicuruzwa'}
              </button>
              {editingId && <button type="button" onClick={clearForm} className="bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-lg text-sm">Kuba</button>}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-extrabold text-gray-800 text-sm">📋 Product List</h3>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full">{products.length} all</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-gray-200">
                  <th className="p-4 pl-6">Product Code</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-center pr-6">Activities</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400 font-medium">No product found..</td>
                  </tr>
                ) : (
                  products.map((prod, index) => {
                    const currentId = prod.productcode || prod.ProductCode || prod.id || prod.ID || index;
                    return (
                      <tr key={currentId} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 pl-6 font-mono font-bold text-blue-600">{prod.productcode || prod.ProductCode}</td>
                        <td className="p-4 font-bold text-gray-900 text-sm">{prod.productname || prod.ProductName}</td>
                        <td className="p-4 text-gray-500">{prod.description || prod.Description || '—'}</td>
                        <td className="p-4 text-right font-bold text-emerald-600">{Number(prod.price || prod.Price || 0).toLocaleString()} FRW</td>
                        <td className="p-4 text-center pr-6 flex justify-center space-x-2">
                          <button onClick={() => startEdit(prod)} className="bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">✏️ Edit</button>
                          <button onClick={() => handleDelete(currentId)} className="bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200">🗑️ Delete</button>
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

export default Product;