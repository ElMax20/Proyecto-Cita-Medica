/**
 * Módulo de Autenticación y Control de Roles (Página 1)
 * Maneja el inicio de sesión centralizado, el conmutador de 3 perfiles
 * y la barra de relleno automático de 1 clic para demostración.
 */

import { DEMO_USERS, store } from './state.js';

export function setupAuth(showToast) {
  const roleTabs = document.querySelectorAll('.role-tab-btn');
  const loginInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const passwordToggleBtn = document.getElementById('btn-toggle-password');
  const loginForm = document.getElementById('unified-login-form');

  // Botones de Autofill Rápido Demo (Página 1)
  const btnDemoDoctor = document.getElementById('btn-demo-doctor');
  const btnDemoPatient = document.getElementById('btn-demo-patient');
  const btnDemoAccountant = document.getElementById('btn-demo-accountant');
  const qrQuickBox = document.getElementById('qr-quick-access-btn');

  let currentSelectedRole = 'doctor';

  // Cambiar rol activo en el switcher de pastillas (Pills)
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSelectedRole = tab.dataset.role;

      // Sugerir credencial según rol en el placeholder
      if (currentSelectedRole === 'doctor') {
        loginInput.placeholder = 'Cédula (0928374651) o usuario (doctor)';
      } else if (currentSelectedRole === 'paciente') {
        loginInput.placeholder = 'Cédula (0987654321) o usuario (paciente)';
      } else if (currentSelectedRole === 'contador') {
        loginInput.placeholder = 'Cédula (0912345678) o usuario (contador)';
      }
    });
  });

  // Mostrar / Ocultar contraseña con icono
  if (passwordToggleBtn) {
    passwordToggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      passwordToggleBtn.innerHTML = isPassword ? '👁️‍🗨️' : '👁️';
    });
  }

  // Función de llenado automático
  function autofillCredentials(roleKey) {
    const user = DEMO_USERS[roleKey];
    if (!user) return;

    // Activar la pestaña correcta
    roleTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.role === user.role);
    });
    currentSelectedRole = user.role;

    loginInput.value = user.username;
    passwordInput.value = user.password;

    showToast(`Credenciales de ${user.name.split(' ')[0]} cargadas. Haz clic en "Iniciar Sesión".`, 'info');
  }

  if (btnDemoDoctor) {
    btnDemoDoctor.addEventListener('click', () => autofillCredentials('doctor'));
  }
  if (btnDemoPatient) {
    btnDemoPatient.addEventListener('click', () => autofillCredentials('paciente'));
  }
  if (btnDemoAccountant) {
    btnDemoAccountant.addEventListener('click', () => autofillCredentials('contador'));
  }

  // Acceso rápido por simulación de tarjeta física QR (Página 1)
  if (qrQuickBox) {
    qrQuickBox.addEventListener('click', () => {
      autofillCredentials('paciente');
      // Login directo del paciente
      store.setCurrentUser(DEMO_USERS.paciente);
      showToast('¡Tarjeta física reconocida por QR! Bienvenido Carlos Mendoza.', 'success');
    });
  }

  // Envío del Formulario de Inicio de Sesión
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredUser = loginInput.value.trim().toLowerCase();
      const enteredPass = passwordInput.value.trim();

      // Buscar usuario demo coincidente por usuario, email o cédula
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
        store.setCurrentUser(matchedUser);
        showToast(`Acceso exitoso. Bienvenido(a), ${matchedUser.name}`, 'success');
      } else {
        showToast('Credenciales incorrectas. Usa la barra inferior para rellenar con 1 clic.', 'danger');
      }
    });
  }
}
