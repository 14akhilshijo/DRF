import React, { useState, useEffect } from 'react';
import { assetsAPI, inventoryAPI, ticketsAPI } from '../../services/api';
import AssetModal from '../modals/AssetModal';
import InventoryModal from '../modals/InventoryModal';

const AdminDashboard = ({ stats, onRefresh }) => {
  const [recentAssets, setRecentAssets] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [assets, inventory, tickets] = await Promise.all([
        assetsAPI.getAll({ page_size: 5, ordering: '-created_at' }),
        inventoryAPI.getLowStock(),
        ticketsAPI.getAll({ page_size: 5, ordering: '-created_at' })
      ]);
      
      setRecentAssets(assets.results || []);
      setLowStockItems(inventory || []);
      setRecentTickets(tickets.results || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handleAssetSave = async () => {
    await fetchDashboardData();
    onRefresh();
    setShowAssetModal(false);
    setSelectedAsset(null);
  };

  const handleInventorySave = async () => {
    await fetchDashboardData();
    onRefresh();
    setShowInventoryModal(false);
    setSelectedInventory(null);
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetsAPI.delete(id);
        await fetchDashboardData();
        onRefresh();
      } catch (error) {
        alert('Failed to delete asset');
      }
    }
  };

  const adminStatCards = [
    {
      title: 'Total Assets',
      value: stats?.total_assets || 0,
      icon: 'fas fa-laptop',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'All registered assets',
      action: () => setShowAssetModal(true)
    },
    {
      title: 'Available Assets',
      value: stats?.available_assets || 0,
      icon: 'fas fa-check-circle',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Ready for assignment'
    },
    {
      title: 'Assigned Assets',
      value: stats?.assigned_assets || 0,
      icon: 'fas fa-user-check',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Currently in use'
    },
    {
      title: 'Open Tickets',
      value: stats?.open_tickets || 0,
      icon: 'fas fa-ticket-alt',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Pending support requests'
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-primary">
            <i className="fas fa-crown me-2"></i>
            Admin Dashboard
          </h1>
          <p className="text-muted">Complete system control and management</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAssetModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Add Asset
          </button>
          <button 
            className="btn btn-success"
            onClick={() => setShowInventoryModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Add Inventory
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={onRefresh}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Admin Stats Cards */}
      <div className="row g-4 mb-5">
        {adminStatCards.map((card, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div 
              className="card h-100 text-white admin-stat-card"
              style={{ background: card.gradient }}
              onClick={card.action}
              role={card.action ? "button" : undefined}
            >
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className={`${card.icon} fa-3x`}></i>
                </div>
                <div className="stat-number">{card.value}</div>
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text opacity-75 small">{card.description}</p>
                {card.action && (
                  <div className="mt-2">
                    <i className="fas fa-plus-circle"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Management Sections */}
      <div className="row g-4">
        {/* Recent Assets */}
        <div className="col-lg-6">
          <div className="card admin-card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-laptop me-2"></i>
                Recent Assets
              </h5>
            </div>
            <div className="card-body">
              {recentAssets.length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-laptop fa-2x text-muted mb-2"></i>
                  <p className="text-muted">No assets found</p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAssetModal(true)}
                  >
                    Add First Asset
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAssets.map((asset) => (
                        <tr key={asset.id}>
                          <td>
                            <div>
                              <div className="fw-bold">{asset.name}</div>
                              <small className="text-muted">{asset.serial_number}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              asset.status === 'available' ? 'bg-success' :
                              asset.status === 'assigned' ? 'bg-primary' :
                              asset.status === 'maintenance' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setShowAssetModal(true);
                                }}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteAsset(asset.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
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
        </div>

        {/* Low Stock Alerts */}
        <div className="col-lg-6">
          <div className="card admin-card">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Low Stock Alerts
              </h5>
            </div>
            <div className="card-body">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                  <p className="text-muted">All inventory levels are good</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Stock</th>
                        <th>Min Level</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((item) => (
                        <tr key={item.id} className="table-warning">
                          <td>
                            <div className="fw-bold">{item.name}</div>
                            <small className="text-muted">{item.sku}</small>
                          </td>
                          <td>
                            <span className="text-danger fw-bold">{item.quantity_in_stock}</span>
                          </td>
                          <td>{item.minimum_stock_level}</td>
                          <td>
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => {
                                setSelectedInventory(item);
                                setShowInventoryModal(true);
                              }}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card admin-card">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-ticket-alt me-2"></i>
                Recent Support Tickets
              </h5>
            </div>
            <div className="card-body">
              {recentTickets.length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-ticket-alt fa-2x text-muted mb-2"></i>
                  <p className="text-muted">No recent tickets</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created By</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <div>
                              <div className="fw-bold">#{ticket.id} - {ticket.title}</div>
                              <small className="text-muted">{ticket.category.replace('_', ' ')}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              ticket.priority === 'urgent' ? 'bg-dark' :
                              ticket.priority === 'high' ? 'bg-danger' :
                              ticket.priority === 'medium' ? 'bg-warning' : 'bg-info'
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              ticket.status === 'open' ? 'bg-danger' :
                              ticket.status === 'in_progress' ? 'bg-warning' :
                              ticket.status === 'resolved' ? 'bg-success' : 'bg-secondary'
                            }`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{ticket.created_by_name}</td>
                          <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAssetModal && (
        <AssetModal
          asset={selectedAsset}
          onSave={handleAssetSave}
          onClose={() => {
            setShowAssetModal(false);
            setSelectedAsset(null);
          }}
        />
      )}

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

      <style jsx>{`
        .admin-dashboard .admin-stat-card {
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .admin-dashboard .admin-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .admin-dashboard .admin-card {
          border: none;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
        }
        
        .admin-dashboard .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;