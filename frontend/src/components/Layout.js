import React from 'react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'assets', label: 'Assets', icon: 'fas fa-laptop' },
        { id: 'inventory', label: 'Inventory', icon: 'fas fa-boxes' },
        { id: 'assignments', label: 'Assignments', icon: 'fas fa-user-check' },
        { id: 'tickets', label: 'Tickets', icon: 'fas fa-ticket-alt' },
      ];
    } else if (user?.role === 'technician') {
      return [
        ...baseItems,
        { id: 'assets', label: 'Assets', icon: 'fas fa-laptop' },
        { id: 'inventory', label: 'Inventory', icon: 'fas fa-boxes' },
        { id: 'assignments', label: 'Assignments', icon: 'fas fa-user-check' },
        { id: 'tickets', label: 'Tickets', icon: 'fas fa-ticket-alt' },
      ];
    } else {
      return [
        ...baseItems,
        { id: 'assets', label: 'My Assets', icon: 'fas fa-laptop' },
        { id: 'tickets', label: 'My Tickets', icon: 'fas fa-ticket-alt' },
      ];
    }
  };

  const menuItems = getMenuItems();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'technician': return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      default: return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return 'fas fa-crown';
      case 'technician': return 'fas fa-tools';
      default: return 'fas fa-user';
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 px-0">
          <div className="sidebar p-3" style={{ background: getRoleColor() }}>
            <div className="text-center mb-4">
              <h4 className="mb-0">
                <i className="fas fa-building me-2"></i>
                Asset Manager
              </h4>
              <small className="text-light opacity-75">v1.0.0</small>
            </div>

            <nav className="nav flex-column">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`nav-link text-start border-0 bg-transparent ${
                    activeTab === item.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <i className={`${item.icon} me-2`}></i>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-4">
              <div className="border-top pt-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-light rounded-circle p-2 me-2">
                    <i className={`${getRoleIcon()} text-primary`}></i>
                  </div>
                  <div>
                    <div className="fw-bold">{user?.first_name} {user?.last_name}</div>
                    <small className="opacity-75 text-capitalize">{user?.role}</small>
                  </div>
                </div>
                <button
                  className="btn btn-outline-light btn-sm w-100"
                  onClick={logout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <div className="main-content p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;