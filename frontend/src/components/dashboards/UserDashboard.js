import React, { useState, useEffect } from 'react';
import { assignmentsAPI, ticketsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TicketModal from '../modals/TicketModal';

const UserDashboard = ({ stats, onRefresh }) => {
  const { user } = useAuth();
  const [myAssets, setMyAssets] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [assignments, tickets] = await Promise.all([
        assignmentsAPI.getAll({ assigned_to: user.id, status: 'active' }),
        ticketsAPI.getAll({ created_by: user.id, page_size: 5 })
      ]);
      
      setMyAssets(assignments.results || []);
      setMyTickets(tickets.results || []);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleTicketSave = async () => {
    await fetchUserData();
    onRefresh();
    setShowTicketModal(false);
  };

  const userStatCards = [
    {
      title: 'My Assets',
      value: myAssets.length,
      icon: 'fas fa-laptop',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Assets assigned to me'
    },
    {
      title: 'My Tickets',
      value: myTickets.length,
      icon: 'fas fa-ticket-alt',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Support tickets I created'
    },
    {
      title: 'Open Tickets',
      value: myTickets.filter(t => t.status === 'open').length,
      icon: 'fas fa-exclamation-circle',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Tickets awaiting response'
    },
    {
      title: 'System Status',
      value: 'Online',
      icon: 'fas fa-check-circle',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      description: 'All systems operational',
      isText: true
    }
  ];

  return (
    <div className="user-dashboard">
      {/* User Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-success">
            <i className="fas fa-user me-2"></i>
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-muted">Your personal asset management dashboard</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success"
            onClick={() => setShowTicketModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Create Ticket
          </button>
          <button 
            className="btn btn-outline-success"
            onClick={onRefresh}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* User Stats Cards */}
      <div className="row g-4 mb-5">
        {userStatCards.map((card, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div 
              className="card h-100 text-white user-stat-card"
              style={{ background: card.gradient }}
            >
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className={`${card.icon} fa-3x`}></i>
                </div>
                <div className="stat-number">
                  {card.isText ? card.value : card.value}
                </div>
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text opacity-75 small">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Sections */}
      <div className="row g-4">
        {/* My Assets */}
        <div className="col-lg-6">
          <div className="card user-card">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-laptop me-2"></i>
                My Assigned Assets
              </h5>
            </div>
            <div className="card-body">
              {myAssets.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-laptop fa-3x text-muted mb-3"></i>
                  <h6>No Assets Assigned</h6>
                  <p className="text-muted">You don't have any assets assigned to you yet.</p>
                  <small className="text-muted">Contact your administrator if you need equipment.</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Assigned Date</th>
                        <th>Expected Return</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAssets.map((assignment) => (
                        <tr key={assignment.id}>
                          <td>
                            <div>
                              <div className="fw-bold">{assignment.asset_name}</div>
                              <small className="text-muted">ID: {assignment.asset}</small>
                            </div>
                          </td>
                          <td>
                            <small>{new Date(assignment.assigned_date).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <small>
                              {assignment.expected_return_date 
                                ? new Date(assignment.expected_return_date).toLocaleDateString()
                                : 'N/A'
                              }
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-success">Active</span>
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

        {/* My Tickets */}
        <div className="col-lg-6">
          <div className="card user-card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-ticket-alt me-2"></i>
                My Support Tickets
              </h5>
            </div>
            <div className="card-body">
              {myTickets.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                  <h6>No Support Tickets</h6>
                  <p className="text-muted">You haven't created any support tickets yet.</p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowTicketModal(true)}
                  >
                    Create Your First Ticket
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <div>
                              <div className="fw-bold">#{ticket.id}</div>
                              <small className="text-muted">{ticket.title}</small>
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
                          <td>
                            <small>{new Date(ticket.created_at).toLocaleDateString()}</small>
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

      {/* Help Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card user-card">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-question-circle me-2"></i>
                Need Help?
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="text-center">
                    <i className="fas fa-ticket-alt fa-3x text-primary mb-3"></i>
                    <h6>Create Support Ticket</h6>
                    <p className="text-muted small">Report issues or request assistance</p>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowTicketModal(true)}
                    >
                      Create Ticket
                    </button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <i className="fas fa-book fa-3x text-success mb-3"></i>
                    <h6>User Guide</h6>
                    <p className="text-muted small">Learn how to use the system</p>
                    <button className="btn btn-outline-success btn-sm">
                      View Guide
                    </button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <i className="fas fa-phone fa-3x text-warning mb-3"></i>
                    <h6>Contact IT</h6>
                    <p className="text-muted small">Direct contact for urgent issues</p>
                    <button className="btn btn-outline-warning btn-sm">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showTicketModal && (
        <TicketModal
          onSave={handleTicketSave}
          onClose={() => setShowTicketModal(false)}
        />
      )}

      <style jsx>{`
        .user-dashboard .user-stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .user-dashboard .user-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        }
        
        .user-dashboard .user-card {
          border: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
        }
        
        .user-dashboard .stat-number {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;