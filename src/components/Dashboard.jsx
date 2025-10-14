import React from 'react';
import authService from '../services/authService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const currentUser = authService.getCurrentUser();

  // Si no hay usuario, no mostramos nada o redirigimos (manejo en App.jsx)
  if (!currentUser) {
    return <h2>No estás autorizado para ver esta página.</h2>;
  }

  // Verificamos si el rol 'ROLE_AGRICULTOR' está en la lista de roles del usuario
  const isAgricultor = currentUser.roles.includes('ROLE_AGRICULTOR');
  
  // Verificamos si el rol 'ROLE_COMPRADOR' está presente
  const isComprador = currentUser.roles.includes('ROLE_COMPRADOR');

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Dashboard</h2>
        <div className="text-end small text-muted">
          Bienvenido, <strong>{(currentUser.name || currentUser.lastname) ? `${currentUser.name || ''} ${currentUser.lastname || ''}`.trim() : currentUser.email}</strong>
        </div>
      </div>

      <div className="mb-3">
        <span className="badge bg-info me-2">Roles</span>
        {currentUser.roles.map((r) => {
          const label = r === 'ROLE_AGRICULTOR' ? 'Agricultor' : r === 'ROLE_COMPRADOR' ? 'Comprador' : r;
          return <span key={r} className="badge bg-secondary me-1">{label}</span>;
        })}
      </div>

      <div className="row g-3">
        {isAgricultor && (
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Panel de Agricultor</h5>
                <p className="text-muted">Aquí puedes gestionar tus productos y cultivos.</p>
                <div className="d-flex gap-2 mt-3">
                  <Link to="/create-product" className="btn btn-success">Crear Producto</Link>
                  <Link to="/register-crop" className="btn btn-outline-primary">Registrar Cultivo</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {isComprador && (
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Panel de Comprador</h5>
                <p className="text-muted">Aquí puedes buscar productos y realizar pedidos.</p>
                <div className="mt-3">
                  <Link to="/marketplace" className="btn btn-primary">Ver Productos en el Mercado</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;