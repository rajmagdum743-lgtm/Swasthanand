import React, { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, ShieldAlert, X, Sparkles, Check, Info } from 'lucide-react';
import { useProducts, type Product } from '../../context/ProductContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useProducts();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    description: '',
    benefitsDescription: '',
    origin: 'Maharashtra, India',
    batchId: '',
    image: '',
    stock: '100',
    harvestDate: new Date().toISOString().split('T')[0],
    weatherTemp: '28°C',
    growthQuality: 'Excellent',
    organicMatter: '4.2%',
    nitrogen: '1.8%',
    zeroPesticides: 'Verified',
    certificateUrl: 'https://example.com/reports/soil-001.pdf'
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      sku: '',
      price: '',
      category: categories[1] || 'Dairy',
      description: '',
      benefitsDescription: '',
      origin: 'Maharashtra, India',
      batchId: 'F-SATARA-2024-X',
      image: '/images/products/premium-desi-ghee.jpg',
      stock: '100',
      harvestDate: new Date().toISOString().split('T')[0],
      weatherTemp: '28°C',
      growthQuality: 'Excellent',
      organicMatter: '4.2%',
      nitrogen: '1.8%',
      zeroPesticides: 'Verified',
      certificateUrl: 'https://example.com/reports/soil-001.pdf'
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProductId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      price: String(product.price),
      category: product.category,
      description: product.description || '',
      benefitsDescription: product.benefitsDescription || '',
      origin: product.origin || 'Maharashtra, India',
      batchId: product.batchId || '',
      image: product.image || '/images/products/premium-desi-ghee.jpg',
      stock: String(product.stock ?? 100),
      harvestDate: product.harvestDate || new Date().toISOString().split('T')[0],
      weatherTemp: product.weatherTemp || '28°C',
      growthQuality: product.growthQuality || 'Excellent',
      organicMatter: product.organicMatter || '4.2%',
      nitrogen: product.nitrogen || '1.8%',
      zeroPesticides: product.zeroPesticides || 'Verified',
      certificateUrl: product.certificateUrl || 'https://example.com/reports/soil-001.pdf'
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        triggerNotification('Product deleted successfully');
      } catch (err) {
        triggerNotification('Failed to delete product', 'error');
      }
    }
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/products/${id}/approve`, { method: 'PUT' });
      triggerNotification(`Product "${name}" approved successfully!`);
      // Optional: Refresh products list by calling a context method if available
      // For now we'll just trigger a page reload or context refresh if it exists
      window.location.reload();
    } catch (err) {
      triggerNotification('Failed to approve product', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      tags: ['organic', formData.category.toLowerCase()]
    };

    try {
      if (modalMode === 'add') {
        await addProduct(parsedData);
        triggerNotification('Product added successfully!');
      } else if (modalMode === 'edit' && selectedProductId) {
        await updateProduct(selectedProductId, parsedData);
        triggerNotification('Product updated successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      triggerNotification('Operation failed. Check connection.', 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-black uppercase tracking-wider ${notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
          >
            {notification.type === 'error' ? <ShieldAlert size={16} /> : <Check size={16} />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest block mb-0.5">Inventory Catalog</span>
          <h2 className="text-2xl font-black text-slate-800">Products & Catalog</h2>
          <p className="text-xs text-slate-500 font-medium">Add, update, or remove organic products from Swasthanand catalog</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-100/50 active:scale-95 transition-transform"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 pl-10 rounded-xl text-xs font-bold transition-all focus:outline-none"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-4">Product details</th>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Batch ID</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100'; }} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 uppercase leading-snug">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{p.origin}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 font-mono">{p.sku || `SW-SKU-${p.id.slice(0, 4).toUpperCase()}`}</td>
                  <td className="p-4 text-slate-600">
                    <span className="px-2.5 py-1 rounded-full text-[9px] bg-slate-100 text-slate-600 border border-slate-200/50 font-black uppercase tracking-wider">{p.category}</span>
                  </td>
                  <td className="p-4 text-right text-teal-600 font-black">₹{p.price}</td>
                  <td className="p-4 text-center text-slate-500 font-mono text-[10px]">{p.batchId || 'N/A'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${(p.stock ?? 100) < 15 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                      {p.stock ?? 100} Units
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {!p.isApproved && (
                        <button
                          onClick={() => handleApprove(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Package size={24} />
                      <span className="text-xs font-bold">No products found matching the criteria.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900 z-[150]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[151] overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-teal-400" size={18} />
                  <h3 className="text-lg font-black uppercase tracking-wider">
                    {modalMode === 'add' ? 'Add New Product' : 'Modify Product'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 border-b pb-2">
                    <Info size={12} /> Basic Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Organic Vedic Ghee"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">SKU / Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.sku}
                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g. GHEE-A2"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Category *</label>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Dairy, Spices, Oils"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Price (INR) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g. 850"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Initial Stock Level *</label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="e.g. 100"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Product Image URL</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/images/products/..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Retail Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Explain product details..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Ayurvedic / Benefits Description</label>
                    <textarea
                      value={formData.benefitsDescription}
                      onChange={e => setFormData({ ...formData, benefitsDescription: e.target.value })}
                      placeholder="Ayurvedic text references, dietary features..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Section 2: Traceability & Origin Fields */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 border-b pb-2">
                    <Package size={12} /> Traceability & Organic Parameters
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Farm Batch Code</label>
                      <input
                        type="text"
                        value={formData.batchId}
                        onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                        placeholder="e.g. F-SATARA-2024-A"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Geographical Origin</label>
                      <input
                        type="text"
                        value={formData.origin}
                        onChange={e => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="e.g. Satara, Maharashtra"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Harvest Date</label>
                      <input
                        type="date"
                        value={formData.harvestDate}
                        onChange={e => setFormData({ ...formData, harvestDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Weather Temperature</label>
                      <input
                        type="text"
                        value={formData.weatherTemp}
                        onChange={e => setFormData({ ...formData, weatherTemp: e.target.value })}
                        placeholder="e.g. 28°C"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Growth Quality</label>
                      <input
                        type="text"
                        value={formData.growthQuality}
                        onChange={e => setFormData({ ...formData, growthQuality: e.target.value })}
                        placeholder="e.g. Excellent / A+"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Soil Organic Matter</label>
                      <input
                        type="text"
                        value={formData.organicMatter}
                        onChange={e => setFormData({ ...formData, organicMatter: e.target.value })}
                        placeholder="e.g. 4.2%"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nitrogen Content</label>
                      <input
                        type="text"
                        value={formData.nitrogen}
                        onChange={e => setFormData({ ...formData, nitrogen: e.target.value })}
                        placeholder="e.g. 1.8%"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Pesticides %</label>
                      <input
                        type="text"
                        value={formData.zeroPesticides}
                        onChange={e => setFormData({ ...formData, zeroPesticides: e.target.value })}
                        placeholder="e.g. Verified / 0.0%"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Certificate Link</label>
                      <input
                        type="text"
                        value={formData.certificateUrl}
                        onChange={e => setFormData({ ...formData, certificateUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-100/50"
                  >
                    {modalMode === 'add' ? 'Save Product' : 'Update Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminProducts;
