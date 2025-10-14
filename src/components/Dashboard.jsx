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
    <div>
      <h2>Dashboard</h2>
      <p>Bienvenido, <strong>{currentUser.email}</strong></p>
      <p>Tus roles: {currentUser.roles.join(', ')}</p>

      <hr />

      {/* --- RENDERIZADO CONDICIONAL --- */}

      {isAgricultor && (
        <div className="agricultor-panel">
          <h3>Panel de Agricultor</h3>
          {/* --- BOTONES CONVERTIDOS A LINKS --- */}
          <Link to="/create-product" className="btn-action">Crear Producto</Link>
          <Link to="/register-crop" className="btn-action">Registrar Cultivo</Link>
          <p>Aquí puedes gestionar tus productos y cultivos.</p>
        </div>
      )}

      {isComprador && (
        <div className="comprador-panel">
          <h3>Panel de Comprador</h3>
          {/* --- BOTÓN CONVERTIDO A LINK --- */}
          <Link to="/marketplace" className="btn-action">Ver Productos en el Mercado</Link>
          <p>Aquí puedes buscar productos y realizar pedidos.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;