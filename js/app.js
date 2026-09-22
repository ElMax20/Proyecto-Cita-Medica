/**
 * Controlador Principal y Router de la Aplicación (SaaS Médico Multisede)
 * Conecta los módulos de Landing, Paciente, Médico y Contadora.
 * Administra el simulador de dispositivo (Desktop vs Redmi Note 390x844px) y Toasts.
 */

import { DEMO_USERS, store } from './state.js';
import { setupAuth } from './auth.js';
import { setupPatientPortal } from './patient.js';
import { setupDoctorPortal } from './doctor.js';
import { setupAccountantPortal } from './accountant.js';

// Sistema de Notificaciones Toast
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-notifications-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-notifications-root';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'danger') icon = '🚨';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${icon}</span>
    <span style="flex: 1; line-height: 1.3;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Inicialización de la Aplicación
document.addEventListener('DOMContentLoaded', () => {
  const deviceContainer = document.getElementById('main-device-container');
  const btnModeDesktop = document.getElementById('btn-mode-desktop');
  const btnModeMobile = document.getElementById('btn-mode-mobile');

  // Vistas de la Aplicación
  const viewLanding = document.getElementById('view-landing');
  const viewPatient = document.getElementById('view-patient');
  const viewDoctor = document.getElementById('view-doctor');
  const viewAccountant = document.getElementById('view-accountant');

  // Elementos del Toolbar Superior
  const toolbarUserGroup = document.getElementById('toolbar-user-group');
  const toolbarUserAvatar = document.getElementById('toolbar-user-avatar');
  const toolbarUserName = document.getElementById('toolbar-user-name');
  const toolbarRoleBadge = document.getElementById('toolbar-role-badge');
  const btnLogout = document.getElementById('btn-logout');
  const btnQuickRoleSwitcher = document.getElementById('btn-quick-switch-role');

  // Alternador de Modo de Dispositivo: Escritorio vs Xiaomi Redmi Note
  function setDeviceMode(mode) {
    store.setViewMode(mode);
    if (deviceContainer) {
      deviceContainer.className = `device-container mode-${mode}`;
    }
    if (btnModeDesktop && btnModeMobile) {
      btnModeDesktop.classList.toggle('active', mode === 'desktop');
      btnModeMobile.classList.toggle('active', mode === 'mobile');
    }
  }

  if (btnModeDesktop) {
    btnModeDesktop.addEventListener('click', () => setDeviceMode('desktop'));
  }
  if (btnModeMobile) {
    btnModeMobile.addEventListener('click', () => setDeviceMode('mobile'));
  }

  // Renderizar Vista Activa
  function renderActiveView() {
    const activeView = store.getActiveView();
    const currentUser = store.getCurrentUser();

    // Ocultar todas las vistas
    if (viewLanding) viewLanding.style.display = 'none';
    if (viewPatient) viewPatient.style.display = 'none';
    if (viewDoctor) viewDoctor.style.display = 'none';
    if (viewAccountant) viewAccountant.style.display = 'none';

    // Manejar toolbar de usuario autenticado
    if (currentUser) {
      if (toolbarUserGroup) toolbarUserGroup.style.display = 'flex';
      if (toolbarUserName) toolbarUserName.textContent = currentUser.name.split(' ')[0];
      if (toolbarUserAvatar) toolbarUserAvatar.src = currentUser.avatar;
      if (toolbarRoleBadge) {
        toolbarRoleBadge.textContent = currentUser.role.toUpperCase();
        toolbarRoleBadge.className = `brand-badge badge-${currentUser.role === 'doctor' ? 'ceibos' : currentUser.role === 'paciente' ? 'alborada' : 'mapasingue'}`;
      }
    } else {
      if (toolbarUserGroup) toolbarUserGroup.style.display = 'none';
    }

    if (activeView === 'landing') {
      if (viewLanding) viewLanding.style.display = 'block';
    } else if (activeView === 'paciente' || activeView === 'patient') {
      if (viewPatient) viewPatient.style.display = 'block';
    } else if (activeView === 'doctor') {
      if (viewDoctor) viewDoctor.style.display = 'flex';
      // Por defecto para doctor, recomendamos la vista móvil (Xiaomi Redmi Note) si lo desea
    } else if (activeView === 'contador' || activeView === 'accountant') {
      if (viewAccountant) viewAccountant.style.display = 'flex';
      // Para contadora sugerimos desktop para ver las tablas cómodamente
      setDeviceMode('desktop');
    }
  }

  // Botón de Cerrar Sesión
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      store.setCurrentUser(null);
      showToast('Sesión cerrada. Regresando al portal de presentación.', 'info');
      renderActiveView();
    });
  }

  // Conmutador Rápido de Roles para Pruebas UI/UX
  if (btnQuickRoleSwitcher) {
    btnQuickRoleSwitcher.addEventListener('click', () => {
      const active = store.getActiveView();
      if (active === 'landing' || active === 'contador') {
        store.setCurrentUser(DEMO_USERS.doctor);
        setDeviceMode('mobile'); // Mostrar vista Xiaomi
        showToast('Cambiando a rol: 👨‍⚕️ Médico Itinerante (Modo Xiaomi Redmi Note)', 'info');
      } else if (active === 'doctor') {
        store.setCurrentUser(DEMO_USERS.paciente);
        showToast('Cambiando a rol: 🧑‍💼 Paciente / Reserva de Citas', 'info');
      } else if (active === 'paciente') {
        store.setCurrentUser(DEMO_USERS.contador);
        setDeviceMode('desktop'); // Mostrar vista escritorio
        showToast('Cambiando a rol: 📊 Contadora Externa / Liquidaciones', 'info');
      }
      renderActiveView();
    });
  }

  // Botón de Consulta Directa de Turno en la Cabecera de la Landing
  const btnLandingQuick = document.getElementById('btn-landing-quick-booking');
  if (btnLandingQuick) {
    btnLandingQuick.addEventListener('click', () => {
      store.setCurrentUser(DEMO_USERS.paciente);
      showToast('Ingresando como paciente para agendar turno.', 'info');
      renderActiveView();
    });
  }

  // Configuración de los submódulos
  setupAuth(showToast);
  setupPatientPortal(showToast);
  setupDoctorPortal(showToast);
  setupAccountantPortal(showToast);

  // Escuchar cambios de estado global
  store.subscribe(() => {
    renderActiveView();
  });

  // Cerrar modales con clic en el fondo
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Render inicial
  setDeviceMode(store.getViewMode() || 'desktop');
  renderActiveView();
});
