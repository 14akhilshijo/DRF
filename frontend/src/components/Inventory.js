import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InventoryModal from './modals/InventoryModal';

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchInventory();
  }, [searchTerm, categoryFilter, showLowStock]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let data;
      
      if (showLowStock) {
        data = await inventoryAPI.getLowStock();
      } else {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (categoryFilter) params.category = categoryFilter;
        data = await inventoryAPI.getAll(params);
      }
      
      setInventory(data.results || data || []);
    } catch (err) {
      setError('Failed to load inventory');
      console.error('Inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    setSelectedInventory(item);
    // For now, just show edit modal for viewing
    setShowInventoryModal(true);
  };

  const handleEdit = (item) => {
    setSelectedInventory(item);
    setShowInventoryModal(true);
  };

  const handleAddStock = async (item) => {
    const quantity = prompt(`Add stock to ${item.name}. Current stock: ${item.quantity_in_stock}. Enter quantity to add:`);
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
      try {
        const newQuantity = item.quantity_in_stock + parseInt(quantity);
        await inventoryAPI.update(item.id, { 
          ...item, 
          quantity_in_stock: newQuantity 
        });
        await fetchInventory();
        alert(`Added ${quantity} units to ${item.name}. New stock: ${newQuantity}`);
      } catch (error) {
        alert('Failed to update stock. Please try again.');
        console.error('Stock update error:', error);
      }
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      try {
        await inventoryAPI.delete(item.id);
        await fetchInventory();
        alert('Inventory item deleted successfully!');
      } catch (error) {
        alert('Failed to delete inventory item. Please try again.');
        console.error('Delete error:', error);
      }
    }
  };

  const handleInventorySave = async () => {
    await fetchInventory();
    setShowInventoryModal(false);
    setSelectedInventory(null);
  };

  const canEdit = () => {
    return user?.role === 'admin' || user?.role === 'technician';
  };

  const canDelete = () => {
    return user?.role === 'admin';
  };

  const getStockStatus = (item) => {
    if (item.is_low_stock) {
      return <span className="badge bg-danger">Low Stock</span>;
    }
    return <span className="badge bg-success">In Stock</span>;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      accessories: 'fas fa-plug',
      cables: 'fas fa-ethernet',
      consumables: 'fas fa-shopping-cart',
      software: 'fas fa-code',
      parts: 'fas fa-cogs',
      other: 'fas fa-cube'
    };
    return icons[category] || icons.other;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Inventory</h1>
          <p className="text-muted">Manage consumable items and supplies</p>
        </div>
        {canEdit() && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowInventoryModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Add Item
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={showLowStock}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={showLowStock}
              >
                <option value="">All Categories</option>
                <option value="accessories">Accessories</option>
                <option value="cables">Cables</option>
                <option value="consumables">Consumables</option>
                <option value="software">Software</option>
                <option value="parts">Parts</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filter</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="lowStockFilter"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="lowStockFilter">
                  Show only low stock items
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="card-body">
          {inventory.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-boxes fa-3x text-muted mb-3"></i>
              <h5>No inventory items found</h5>
              <p className="text-muted">
                {showLowStock ? 'No low stock items' : 'Try adjusting your search criteria'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock Level</th>
                    <th>Min. Level</th>
                    <th>Unit Price</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className={item.is_low_stock ? 'table-warning' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`${getCategoryIcon(item.category)} text-primary me-2`}></i>
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            {item.supplier && (
                              <small className="text-muted">Supplier: {item.supplier}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code>{item.sku}</code>
                      </td>
                      <td>
                        <span className="text-capitalize">{item.category}</span>
                      </td>
                      <td>
                        <span className={`fw-bold ${item.is_low_stock ? 'text-danger' : 'text-success'}`}>
                          {item.quantity_in_stock}
                        </span>
                      </td>
                      <td>{item.minimum_stock_level}</td>
                      <td>${item.unit_price}</td>
                      <td>
                        <span className="fw-bold">${item.total_value}</span>
                      </td>
                      <td>{getStockStatus(item)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleView(item)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {canEdit() && (
                            <>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => handleEdit(item)}
                                title="Edit Item"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => handleAddStock(item)}
                                title="Add Stock"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </>
                          )}
                          {canDelete() && (
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(item)}
                              title="Delete Item"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showInventoryModal && (
        <InventoryModal
          inventory={selectedInventory}
          onSave={handleInventorySave}
          onClose={() => {
            setShowInventoryModal(false);
            setSelectedInventory(null);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;