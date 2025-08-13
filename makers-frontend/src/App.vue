<template>
  <div id="app" class="bg-gray-50">
    <Dashboard v-if="isAuthenticated" @logout="handleLogout" />
    <Login v-else @login-success="handleLogin" />
  </div>
</template>

<script>
import Dashboard from './layouts/Dashboard.vue';
import Login from './layouts/Login.vue';
export default {
  components: {
    Dashboard,
    Login
  },
  data() {
    return {
      isAuthenticated: true
    }
  },
  methods:
  {
    handleLogin() {
      // Cuando el login es exitoso, actualizamos el estado
      this.isAuthenticated = true;
      // En una app real, guardarías un token aquí
      localStorage.setItem('user-token', 'un-token-secreto');
    },
    handleLogout() {
      // Al cerrar sesión, revertimos el estado
      this.isAuthenticated = false;
      // Y limpiamos el token
      localStorage.removeItem('user-token');
    },
    checkAuth() {
      // Al cargar la app, revisamos si ya existe un token
      const token = localStorage.getItem('user-token');
      if (token) {
        this.isAuthenticated = true;
      }
    }
  },
  created() {
    // Verificamos la autenticación cuando el componente se crea
    this.checkAuth();
  },
}
</script>