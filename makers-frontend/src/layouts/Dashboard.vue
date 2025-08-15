<template>
    <div id="dashboard-container">
        <div class="flex h-screen bg-gray-100">
            <!-- Sidebar -->
            <aside class="w-64 bg-gray-900 text-gray-300 flex flex-col flex-shrink-0">
                <div class="h-20 flex items-center justify-center border-b border-gray-800">
                    <div class="flex items-center space-x-3">
                        <div class="bg-indigo-500 p-2 rounded-lg">
                            <i data-feather="command" class="text-white"></i>
                        </div>
                        <h2 class="text-xl font-bold text-white">My App</h2>
                    </div>
                </div>
                <nav id="sidebar-nav" class="flex-1 px-4 py-6 space-y-2">
                    <a href="#"
                        class="sidebar-link flex items-center px-4 py-3 text-sm font-semibold rounded-lg sidebar-link-active">
                        <i data-feather="home" class="w-5 h-5 mr-3"></i> Dashboard
                    </a>
                    <a href="#"
                        class="sidebar-link flex items-center px-4 py-3 text-sm font-semibold hover:bg-gray-800 hover:text-white rounded-lg transition duration-200">
                        <i data-feather="bar-chart-2" class="w-5 h-5 mr-3"></i> Analytics
                    </a>
                    <a href="#"
                        class="sidebar-link flex items-center px-4 py-3 text-sm font-semibold hover:bg-gray-800 hover:text-white rounded-lg transition duration-200">
                        <i data-feather="users" class="w-5 h-5 mr-3"></i> Users
                    </a>
                    <a href="#"
                        class="sidebar-link flex items-center px-4 py-3 text-sm font-semibold hover:bg-gray-800 hover:text-white rounded-lg transition duration-200">
                        <i data-feather="settings" class="w-5 h-5 mr-3"></i> Settings
                    </a>
                </nav>
                <div class="px-4 py-4 border-t border-gray-800">
                    <button id="logout-button"
                        class="w-full flex items-center px-4 py-3 text-sm font-semibold text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition duration-200">
                        <i data-feather="log-out" class="w-5 h-5 mr-3"></i> Logout
                    </button>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 flex flex-col overflow-hidden">
                <!-- Header -->
                <header class="bg-white border-b border-gray-200 h-20 flex-shrink-0">
                    <div class="flex items-center justify-between px-6 h-full">
                        <div class="flex items-center space-x-4">
                            <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
                            <button id="generate-summary-button"
                                class="flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-4 py-2 rounded-lg text-sm transition duration-200">
                                <i data-feather="sparkles" class="w-4 h-4"></i>
                                <span>✨ Generate AI Summary</span>
                            </button>
                        </div>
                        <div class="flex items-center space-x-5">
                            <button class="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                <i data-feather="bell" class="w-6 h-6"></i>
                            </button>
                            <div class="flex items-center space-x-3">
                                <img src="https://placehold.co/40x40/6366F1/FFFFFF?text=A" alt="Avatar"
                                    class="w-10 h-10 rounded-full border-2 border-indigo-500">
                                <div>
                                    <p class="font-semibold text-gray-800 text-sm">Admin</p>
                                    <p class="text-xs text-gray-500">Superuser</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Content Area -->
                <div class="flex-1 p-6 lg:p-8 overflow-y-auto">
                    <!-- Stat Cards Summary -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        <div
                            class="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between stat-card transition-all duration-300">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Sales</p>
                                <p class="text-3xl font-extrabold text-gray-800">$24,805</p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-xl">
                                <i data-feather="dollar-sign" class="w-7 h-7 text-blue-600"></i>
                            </div>
                        </div>
                        <div
                            class="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between stat-card transition-all duration-300">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">New Orders</p>
                                <p class="text-3xl font-extrabold text-gray-800">1,280</p>
                            </div>
                            <div class="bg-green-100 p-3 rounded-xl">
                                <i data-feather="shopping-cart" class="w-7 h-7 text-green-600"></i>
                            </div>
                        </div>
                        <div
                            class="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between stat-card transition-all duration-300">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">New Customers</p>
                                <p class="text-3xl font-extrabold text-gray-800">356</p>
                            </div>
                            <div class="bg-yellow-100 p-3 rounded-xl">
                                <i data-feather="users" class="w-7 h-7 text-yellow-600"></i>
                            </div>
                        </div>
                        <div
                            class="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between stat-card transition-all duration-300">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Bounce Rate</p>
                                <p class="text-3xl font-extrabold text-gray-800">47.5%</p>
                            </div>
                            <div class="bg-red-100 p-3 rounded-xl">
                                <i data-feather="activity" class="w-7 h-7 text-red-600"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Chart and Table -->
                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <!-- Chart Column -->
                        <div class="xl:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                            <h3 class="text-xl font-bold text-gray-800 mb-4">Revenue Analysis</h3>
                            <canvas id="revenueChart"></canvas>
                        </div>
                        <!-- Table Column -->
                        <div class="bg-white p-6 rounded-2xl shadow-md">
                            <h3 class="text-xl font-bold text-gray-800 mb-4">Recent Orders</h3>
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <div class="p-3 bg-green-100 rounded-full mr-4"><i data-feather="check-circle"
                                            class="w-5 h-5 text-green-600"></i></div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Order #85632</p>
                                        <p class="text-sm text-gray-500">$120.50 - Completed</p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <div class="p-3 bg-yellow-100 rounded-full mr-4"><i data-feather="loader"
                                            class="w-5 h-5 text-yellow-600"></i></div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Order #85631</p>
                                        <p class="text-sm text-gray-500">$89.99 - Pending</p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <div class="p-3 bg-green-100 rounded-full mr-4"><i data-feather="check-circle"
                                            class="w-5 h-5 text-green-600"></i></div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Order #85630</p>
                                        <p class="text-sm text-gray-500">$250.00 - Completed</p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <div class="p-3 bg-red-100 rounded-full mr-4"><i data-feather="x-circle"
                                            class="w-5 h-5 text-red-600"></i></div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Order #85629</p>
                                        <p class="text-sm text-gray-500">$45.75 - Cancelled</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        <AiChat />
    </div>
</template>

<script>
import AiChat from '@/components/AiChat.vue';
export default {
    components: {
        AiChat
    }
}
</script>
