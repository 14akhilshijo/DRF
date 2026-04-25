import React, { useState, useEffect } from 'react';
import { assetsAPI, assignmentsAPI, ticketsAPI } from '../../services/api';
import AssignmentModal from '../modals/AssignmentModal';
import TicketModal from '../modals/TicketModal';

const TechnicianDashboard = ({ stats, onRefresh }) => {
  const [myAssignments, setMyAssignments] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [maintenanceAssets, setMaintenanceAssets] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTechnicianData();
  }, []);

  const fetchTechnicianData = async () => {
    try {
      const [assignments, tickets, assets] = await Promise.all([
        assignmentsAPI.getAll({ status: 'active', page_size: 5 }),
        ticketsAPI.getAll({ status: 'open', page_size: 5 }),
        assetsAPI.getAll({ status: 'maintenance', page_size: 5 })
      ]);
      
      setMyAssignments(assignments.results || []);
      setMyTickets(tickets.results || []);
      setMaintenanceAssets(assets.results || []);
    } catch (error) {
      console.error('Failed to fetch technician data:', error);
    }
  };

  const handleAssignmentSave = async () => {
    await fetchTechnicianData();
    onRefresh();
    setShowAssignmentModal(false);
  };

  const handleTicketUpdate = async () => {
    await fetchTechnicianData();
    onRefresh();
    setShowTicketModal(false);
    setSelectedTicket(null);
  };

  const handleAssetMaintenance = async (assetId, newStatus) => {
    try {
      await assetsAPI.update(assetId, { status: newStatus });
      await fetchTechnicianData();
      onRefresh();
    } catch (error) {
      alert('Failed to update asset status');
    }
  };

  const techStatCards = [
    {
      title: 'Active Assignments',
      value: stats?.assigned_assets || 0,
      icon: 'fas fa-user-check',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Assets currently assigned',
      color: 'primary'
    },
    {
      title: 'Available Assets',
      value: stats?.available_assets || 0,
      icon: 'fas fa-check-circle',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      description: 'Ready for assignment',
      color: 'success'
    },
    {
      title: 'Maintenance Queue',
      value: maintenanceAssets.length,
      icon: 'fas fa-tools',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      description: 'Assets under maintenance',
      color: 'warning'
    },
    {
      title: 'Open Tickets',
      value: stats?.open_tickets || 0,
      icon: 'fas fa-ticket-alt',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Pending support requests',
      color: 'danger'
    }
  ];

  return (
    <div className="technician-dashboard">
      {/* Technician Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-info">
            <i className="fas fa-tools me-2"></i>
            Technician Dashboard
          </h1>
          <p className="text-muted">Asset maintenance and assignment management</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-info"
            onClick={() => setShowAssignmentModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            New Assignment
          </button>
          <button 
            className="btn btn-outline-info"
            onClick={onRefresh}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Technician Stats Cards */}
      <div className="row g-4 mb-5">
        {techStatCards.map((card, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div 
              className="card h-100 text-white tech-stat-card"
              style={{ background: card.gradient }}
            >
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className={`${card.icon} fa-3x`}></i>
                </div>
                <div className="stat-number">{card.value}</div>
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text opacity-75 small">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Work Sections */}
      <div className="row g-4">
        {/* Active Assignments */}
        <div className="col-lg-6">
          <div className="card tech-card">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-user-check me-2"></i>
                Active Assignments
              </h5>
            </div>
            <div className="card-body">
              {myAssignments.length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-user-check fa-2x text-muted mb-2"></i>
                  <p className="text-muted">No active assignments</p>
                  <button 
                    className="btn btn-info btn-sm"
                    onClick={() => setShowAssignmentModal(true)}
                  >
                    Create Assignment
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Assigned To</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAssignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td>
                            <div>
                              <div className="fw-bold">{assignment.asset_name}</div>
                              <small className="text-muted">ID: {assignment.asset}</small>
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold">{assignment.assigned_to_name}</div>
                          </td>
                          <td>
                            <small>{new Date(assignment.assigned_date).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => {
                                // Handle return asset
                                if (window.confirm('Mark this assignment as returned?')) {
                                  // Implementation for returning asset
                                }
                              }}
                            >
                              <i className="fas fa-undo"></i>
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

        {/* Maintenance Queue */}
        <div className="col-lg-6">
          <div className="card tech-card">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">
                <i className="fas fa-tools me-2"></i>
                Maintenance Queue
              </h5>
            </div>
            <div className="card-body">
              {maintenanceAssets.length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                  <p className="text-muted">No assets in maintenance</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Serial</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceAssets.map((asset) => (
                        <tr key={asset.id}>
                          <td>
                            <div>
                              <div className="fw-bold">{asset.name}</div>
                              <small className="text-muted">{asset.brand} {asset.model}</small>
                            </div>
                          </td>
                          <td>
                            <code>{asset.serial_number}</code>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => handleAssetMaintenance(asset.id, 'available')}
                                title="Mark as Available"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleAssetMaintenance(asset.id, 'retired')}
                                title="Mark as Retired"
                              >
                                <i className="fas fa-times"></i>
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
      </div>

      {/* Support Tickets */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card tech-card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-ticket-alt me-2"></i>
                Open Support Tickets
              </h5>
            </div>
            <div className="card-body">
              {myTickets.length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-ticket-alt fa-2x text-muted mb-2"></i>
                  <p className="text-muted">No open tickets</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Priority</th>
                        <th>Category</th>
                        <th>Created By</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <div>
                              <div className="fw-bold">#{ticket.id} - {ticket.title}</div>
                              <small className="text-muted text-truncate d-block" style={{maxWidth: '200px'}}>
                                {ticket.description}
                              </small>
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
                            <span className="text-capitalize">
                              {ticket.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{ticket.created_by_name}</td>
                          <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowTicketModal(true);
                                }}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => {
                                  // Handle assign to self
                                }}
                              >
                                <i className="fas fa-user-plus"></i>
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
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card tech-card">
            <div className="card-header bg-secondary text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-info w-100"
                    onClick={() => setShowAssignmentModal(true)}
                  >
                    <i className="fas fa-user-plus d-block mb-2 fa-2x"></i>
                    Create Assignment
                  </button>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-outline-warning w-100">
                    <i className="fas fa-tools d-block mb-2 fa-2x"></i>
                    Schedule Maintenance
                  </button>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-outline-success w-100">
                    <i className="fas fa-check-circle d-block mb-2 fa-2x"></i>
                    Complete Maintenance
                  </button>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-outline-primary w-100">
                    <i className="fas fa-clipboard-list d-block mb-2 fa-2x"></i>
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAssignmentModal && (
        <AssignmentModal
          onSave={handleAssignmentSave}
          onClose={() => setShowAssignmentModal(false)}
        />
      )}

      {showTicketModal && selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onSave={handleTicketUpdate}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
          }}
        />
      )}

      <style jsx>{`
        .technician-dashboard .tech-stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .technician-dashboard .tech-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        .technician-dashboard .tech-card {
          border: none;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        
        .technician-dashboard .stat-number {
          font-size: 2.2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default TechnicianDashboard;