/**
 * Módulo de Autenticación y Control de Roles (Montepiedra Salud)
 * Maneja el inicio de sesión manual seguro, validación de credenciales (cédula o usuario + contraseña)
 * y previene cualquier acceso automático no autorizado.
 */

import { DEMO_USERS, store } from './state.js';

export function setupAuth(showToast) {
  const roleTabs = document.querySelectorAll('.role-tab-btn');
  const loginInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const passwordToggleBtn = document.getElementById('btn-toggle-password');
  const loginForm = document.getElementById('unified-login-form');

  let currentSelectedRole = 'doctor';

  // Cambiar rol activo en el selector de pestañas (guía visual para el usuario)
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSelectedRole = tab.dataset.role;

      // Mantener texto de ejemplo solicitado: Cedula o Usuario
      if (loginInput) {
        loginInput.placeholder = 'Cedula o Usuario';
      }
    });
  });

  // Mostrar / Ocultar contraseña con icono
  if (passwordToggleBtn && passwordInput) {
    passwordToggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      passwordToggleBtn.innerHTML = isPassword ? '👁️‍🗨️' : '👁️';
    });
  }

  // Procesar envío del formulario: El usuario DEBE digitar sus credenciales manualmente
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredUser = (loginInput ? loginInput.value : '').trim().toLowerCase();
      const enteredPass = (passwordInput ? passwordInput.value : '').trim();

      if (!enteredUser || !enteredPass) {
        showToast('Por favor ingrese su usuario o cédula y su contraseña.', 'warning');
        return;
      }

      // Buscar usuario registrado coincidente por usuario, email o número de cédula
      let matchedUser = null;
      for (const key in DEMO_USERS) {
        const u = DEMO_USERS[key];
        if (
          (u.username.toLowerCase() === enteredUser ||
           u.email.toLowerCase() === enteredUser ||
           u.idNumber === enteredUser) &&
          u.password === enteredPass
        ) {
          matchedUser = u;
          break;
        }
      }

      if (matchedUser) {
        // Autenticación manual exitosa
        store.setCurrentUser(matchedUser);
        showToast(`Acceso exitoso. Bienvenido(a), ${matchedUser.name}`, 'success');

        // Limpiar campos del formulario por seguridad
        if (loginInput) loginInput.value = '';
        if (passwordInput) passwordInput.value = '';
      } else {
        showToast('Credenciales incorrectas. Verifique su usuario o cédula y contraseña ingresada.', 'danger');
      }
    });
  }
}
