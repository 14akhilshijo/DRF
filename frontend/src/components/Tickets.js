import React, { useState, useEffect } from 'react';
import { ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketModal from './modals/TicketModal';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      
      const data = await ticketsAPI.getAll(params);
      setTickets(data.results || []);
    } catch (err) {
      setError('Failed to load tickets');
      console.error('Tickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (ticket) => {
    alert(`Ticket Details:\n\nID: #${ticket.id}\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nCategory: ${ticket.category.replace('_', ' ')}\nPriority: ${ticket.priority}\nStatus: ${ticket.status}\nCreated By: ${ticket.created_by_name}\nAssigned To: ${ticket.assigned_to_name || 'Unassigned'}\nAsset: ${ticket.asset_name || 'No specific asset'}\nCreated: ${formatDate(ticket.created_at)}`);
  };

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleResolve = async (ticket) => {
    if (window.confirm(`Mark ticket #${ticket.id} as resolved?\n\nTitle: ${ticket.title}`)) {
      try {
        await ticketsAPI.update(ticket.id, {
          ...ticket,
          status: 'resolved'
        });
        await fetchTickets();
        alert('Ticket marked as resolved successfully!');
      } catch (error) {
        alert('Failed to update ticket. Please try again.');
        console.error('Resolve error:', error);
      }
    }
  };

  const handleTicketSave = async () => {
    await fetchTickets();
    setShowTicketModal(false);
    setSelectedTicket(null);
  };

  const canEdit = () => {
    return user?.role === 'admin' || user?.role === 'technician';
  };

  const canCreate = () => {
    return true; // All users can create tickets
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { class: 'bg-danger', text: 'Open' },
      in_progress: { class: 'bg-warning', text: 'In Progress' },
      resolved: { class: 'bg-success', text: 'Resolved' },
      closed: { class: 'bg-secondary', text: 'Closed' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { class: 'bg-info', text: 'Low' },
      medium: { class: 'bg-warning', text: 'Medium' },
      high: { class: 'bg-danger', text: 'High' },
      urgent: { class: 'bg-dark', text: 'Urgent' }
    };
    
    const config = priorityConfig[priority] || { class: 'bg-secondary', text: priority };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      hardware_issue: 'fas fa-wrench',
      software_issue: 'fas fa-bug',
      access_request: 'fas fa-key',
      maintenance: 'fas fa-tools',
      replacement: 'fas fa-exchange-alt',
      other: 'fas fa-question-circle'
    };
    return icons[category] || icons.other;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
          <h1 className="h3 mb-0">Support Tickets</h1>
          <p className="text-muted">Manage support requests and issues</p>
        </div>
        {canCreate() && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowTicketModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Create Ticket
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
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="hardware_issue">Hardware Issue</option>
                <option value="software_issue">Software Issue</option>
                <option value="access_request">Access Request</option>
                <option value="maintenance">Maintenance</option>
                <option value="replacement">Replacement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        <div className="card-body">
          {tickets.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
              <h5>No tickets found</h5>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Assigned To</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`${getCategoryIcon(ticket.category)} text-primary me-2`}></i>
                          <div>
                            <div className="fw-bold">#{ticket.id} - {ticket.title}</div>
                            <small className="text-muted text-truncate" style={{maxWidth: '200px', display: 'block'}}>
                              {ticket.description}
                            </small>
                            {ticket.asset_name && (
                              <small className="text-info">Asset: {ticket.asset_name}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-capitalize">
                          {ticket.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{getPriorityBadge(ticket.priority)}</td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-1 me-2">
                            <i className="fas fa-user text-primary"></i>
                          </div>
                          <small>{ticket.created_by_name}</small>
                        </div>
                      </td>
                      <td>
                        {ticket.assigned_to_name ? (
                          <div className="d-flex align-items-center">
                            <div className="bg-success rounded-circle p-1 me-2">
                              <i className="fas fa-user text-white"></i>
                            </div>
                            <small>{ticket.assigned_to_name}</small>
                          </div>
                        ) : (
                          <span className="text-muted">Unassigned</span>
                        )}
                      </td>
                      <td>{formatDate(ticket.created_at)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleView(ticket)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {canEdit() && (
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => handleEdit(ticket)}
                              title="Edit Ticket"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                          {ticket.status === 'open' && canEdit() && (
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleResolve(ticket)}
                              title="Mark as Resolved"
                            >
                              <i className="fas fa-check"></i>
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
      {showTicketModal && (
        <TicketModal
          ticket={selectedTicket}
          onSave={handleTicketSave}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

export default Tickets;