<template>
    <!-- Contenedor del Login -->
    <div id="login-container" class="min-h-screen flex items-center justify-center p-4 login-bg view-transition">
        <div class="w-full max-w-sm">
            <div class="bg-white p-8 rounded-2xl shadow-xl">
                <div class="text-center mb-8">
                    <div class="inline-block bg-indigo-100 p-3 rounded-full mb-4">
                        <i data-feather="lock" class="w-8 h-8 text-indigo-600"></i>
                    </div>
                    <h1 class="text-3xl font-extrabold text-gray-900">Acceso Seguro</h1>
                    <p class="text-gray-500 mt-2">Bienvenido de nuevo.</p>
                </div>
                <form id="login-form" novalidate>
                    <!-- Campo de Email -->
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                        <input type="email" id="email" name="email"
                            class="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition duration-200"
                            placeholder="tu@email.com" value="admin@demo.com" required>
                    </div>
                    <!-- Campo de Contraseña -->
                    <div class="mb-6">
                        <label for="password" class="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                        <div class="relative">
                            <input type="password" id="password" name="password"
                                class="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition duration-200"
                                placeholder="••••••••" value="password" required>
                            <button type="button" id="toggle-password"
                                class="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-indigo-600">
                                <i data-feather="eye" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>
                    <!-- Mensaje de Error -->
                    <div id="error-message"
                        class="text-red-600 bg-red-100 p-3 rounded-lg text-sm text-center mb-4 hidden font-semibold">
                    </div>
                    <!-- Botón de Login -->
                    <div>
                        <button type="submit" id="login-button"
                            class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-300 transform hover:scale-105 flex items-center justify-center">
                            <span id="login-button-text">Iniciar Sesión</span>
                            <div id="login-spinner"
                                class="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full hidden">
                            </div>
                        </button>
                    </div>
                </form>
            </div>
            <p class="text-center text-gray-500 text-xs mt-8">
                © 2024 Tu Compañía. Todos los derechos reservados.
            </p>
        </div>
    </div>
</template>

<script>
export default {

}
</script>