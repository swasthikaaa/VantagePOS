import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import Loader from '../components/Loader';
import useSearchStore from '../store/useSearchStore';
import { Package, FolderTree, Scale, Plus, Trash2, Edit2, Search, Filter, ChevronRight, AlertCircle, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductManagement = () => {
    const queryClient = useQueryClient();
    const query = useSearchStore(state => state.query);

    const [activeTab, setActiveTab] = useState('products');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // --- FORMS ---
    const [productForm, setProductForm] = useState({
        name: '', category: '', unit: '', basePrice: 0, description: '', totalStock: 0, alertQuantity: 0
    });
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [unitForm, setUnitForm] = useState({ name: '', shortName: '' });


    // --- QUERIES ---
    const { data: products, isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await axios.get('/products');
            return data.data || data;
        }
    });

    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await axios.get('/categories');
            return data.data || data;
        }
    });

    const { data: units, isLoading: unitsLoading } = useQuery({
        queryKey: ['units'],
        queryFn: async () => {
            const { data } = await axios.get('/units');
            return data.data || data;
        }
    });

    // --- MUTATIONS ---
    // Products
    const createProduct = useMutation({
        mutationFn: (data) => axios.post('/products', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            setShowModal(false);
            toast.success('Product created successfully!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to create product');
        }
    });

    const updateProduct = useMutation({
        mutationFn: (data) => axios.put(`/products/${data._id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            setShowModal(false);
            toast.success('Product updated successfully!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update product');
        }
    });

    const deleteProduct = useMutation({
        mutationFn: (id) => axios.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('Product deleted successfully');
        },
        onError: (err) => toast.error('Failed to delete product')
    });

    // Categories
    const createCategory = useMutation({
        mutationFn: (data) => axios.post('/categories', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            setShowModal(false);
            toast.success('Category created successfully!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to create category');
        }
    });

    const updateCategory = useMutation({
        mutationFn: (data) => axios.put(`/categories/${data._id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            setShowModal(false);
            toast.success('Category updated successfully!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update category');
        }
    });

    const deleteCategory = useMutation({
        mutationFn: (id) => axios.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success('Category deleted successfully');
        },
        onError: (err) => toast.error('Failed to delete category')
    });

    // Units
    const createUnit = useMutation({
        mutationFn: (data) => axios.post('/units', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['units']);
            setShowModal(false);
            toast.success('Unit created successfully!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to create unit');
        }
    });

    const updateUnit = useMutation({
        mutationFn: (data) => axios.put(`/units/${data._id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['units']);
            setShowModal(false);
            toast.success('Unit updated successfully!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update unit');
        }
    });

    const deleteUnit = useMutation({
        mutationFn: (id) => axios.delete(`/units/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['units']);
            toast.success('Unit deleted successfully');
        },
        onError: (err) => toast.error('Failed to delete unit')
    });

    // --- LOGIC ---
    if (productsLoading || categoriesLoading || unitsLoading) return <Loader />;

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(query.toLowerCase())
    );

    // --- HELPERS ---

    const handleCreate = (e) => {
        e.preventDefault();
        if (editingItem) {
            if (activeTab === 'products') {
                updateProduct.mutate({ ...productForm, _id: editingItem._id });
            } else if (activeTab === 'categories') {
                updateCategory.mutate({ ...categoryForm, _id: editingItem._id });
            } else if (activeTab === 'units') {
                updateUnit.mutate({ ...unitForm, _id: editingItem._id });
            }
        } else {
            if (activeTab === 'products') createProduct.mutate(productForm);
            if (activeTab === 'categories') createCategory.mutate(categoryForm);
            if (activeTab === 'units') createUnit.mutate(unitForm);
        }
    };

    const openNewModal = () => {
        setEditingItem(null);
        setProductForm({ name: '', category: '', unit: '', basePrice: 0, description: '', totalStock: 0, alertQuantity: 0 });
        setCategoryForm({ name: '', description: '' });
        setUnitForm({ name: '', shortName: '' });
        setShowModal(true);
    };

    // --- RENDER HELPERS ---
    const tabs = [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'units', label: 'Units', icon: Scale },
    ];

    const getCategoryName = (id) => categories?.find(c => c._id === id)?.name || 'Unknown';
    const getUnitName = (id) => units?.find(u => u._id === id)?.shortName || '';

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Inventory</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manage stock items and categories</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon size={16} />
                                <span className="text-xs sm:text-sm">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={openNewModal}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 w-full sm:w-auto text-sm"
                    >
                        <Plus size={20} />
                        Add {activeTab === 'categories' ? 'Category' : activeTab === 'units' ? 'Unit' : 'Product'}
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">

                {/* PRODUCTS TABLE */}
                {activeTab === 'products' && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 sm:px-8 py-4 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Product</th>
                                    <th className="px-6 sm:px-8 py-4 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Category</th>
                                    <th className="px-6 sm:px-8 py-4 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Unit</th>
                                    <th className="px-6 sm:px-8 py-4 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Price</th>
                                    <th className="px-6 sm:px-8 py-4 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Stock</th>
                                    <th className="px-6 sm:px-8 py-4 sm:py-6 text-right text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 uppercase tracking-tight">
                                {filteredProducts?.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold text-xs">No products found</td></tr>
                                ) : filteredProducts?.map(product => (
                                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 sm:px-8 py-4 sm:py-6">
                                            <div className="font-black text-slate-900 text-sm">{product.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]">{product.description}</div>
                                        </td>
                                        <td className="px-6 sm:px-8 py-4 sm:py-6">
                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black">
                                                {product.category?.name || getCategoryName(product.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs text-slate-600 font-black">
                                            {product.unit?.shortName || getUnitName(product.unit) || '-'}
                                        </td>
                                        <td className="px-6 sm:px-8 py-4 sm:py-6 font-black text-slate-900 text-sm">
                                            ${product.basePrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 sm:px-8 py-4 sm:py-6">
                                            <div className={`text-xs font-black ${product.totalStock <= (product.alertQuantity || 0) ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>
                                                {product.totalStock} {getUnitName(product.unit)}
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(product);
                                                        setProductForm({
                                                            name: product.name,
                                                            category: product.category?._id || product.category,
                                                            unit: product.unit?._id || product.unit,
                                                            basePrice: product.basePrice,
                                                            description: product.description,
                                                            totalStock: product.totalStock,
                                                            alertQuantity: product.alertQuantity || 0,
                                                        });
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct.mutate(product._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* CATEGORIES TABLE */}
                {activeTab === 'categories' && (
                    <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {categories?.map(cat => (
                            <div key={cat._id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                        <FolderTree size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => {
                                                setEditingItem(cat);
                                                setCategoryForm({ name: cat.name, description: cat.description });
                                                setShowModal(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => deleteCategory.mutate(cat._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-black text-slate-900 text-base mb-1 uppercase tracking-tight">{cat.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{cat.description || 'No description'}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* UNITS TABLE */}
                {activeTab === 'units' && (
                    <div className="p-4 sm:p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        {units?.map(unit => (
                            <div key={unit._id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group hover:shadow-lg transition-all text-center">
                                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => {
                                            setEditingItem(unit);
                                            setUnitForm({ name: unit.name, shortName: unit.shortName });
                                            setShowModal(true);
                                        }}
                                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    <button
                                        onClick={() => deleteUnit.mutate(unit._id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 truncate px-2">{unit.shortName}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate px-2">{unit.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl p-6 sm:p-10 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                                    {editingItem ? 'Update' : 'New'} {activeTab === 'categories' ? 'Category' : activeTab === 'units' ? 'Unit' : 'Product'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">

                                {/* PRODUCT FORM */}
                                {activeTab === 'products' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Name</label>
                                            <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                                <select required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                    value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                                                    <option value="">Select...</option>
                                                    {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit</label>
                                                <select required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                    value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })}>
                                                    <option value="">Select...</option>
                                                    {units?.map(u => <option key={u._id} value={u._id}>{u.shortName}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Price</label>
                                                <input required type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                    value={productForm.basePrice} onChange={e => setProductForm({ ...productForm, basePrice: parseFloat(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Opening Stock</label>
                                                <input required type="number" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                    value={productForm.totalStock} onChange={e => setProductForm({ ...productForm, totalStock: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stock Alert (Threshold)</label>
                                                <input required type="number" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                    value={productForm.alertQuantity} onChange={e => setProductForm({ ...productForm, alertQuantity: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                            <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm resize-none"
                                                rows="3" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {/* CATEGORY FORM */}
                                {activeTab === 'categories' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category Name</label>
                                            <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                            <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm resize-none"
                                                rows="4" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {/* UNIT FORM */}
                                {activeTab === 'units' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Name</label>
                                            <input required type="text" placeholder="e.g. Kilogram" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Short Name</label>
                                            <input required type="text" placeholder="e.g. kg" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                value={unitForm.shortName} onChange={e => setUnitForm({ ...unitForm, shortName: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4 active:scale-95">
                                    {editingItem ? 'Update Changes' : 'Create Now'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductManagement;
