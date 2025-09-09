import React from 'react'
import { Building, Users, BarChart3, LogOut } from 'lucide-react'

const GlobalAdminDashboard: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/Logo.svg" alt="Raed Logo" className="h-8 w-auto" />
              <span className="ml-3 text-xl font-semibold text-gray-900">Painel Global</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Admin Global</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Bem-vindo ao Painel Global da Raed
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Gerencie todas as empresas e usuários do sistema
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Empresas</p>
                    <p className="text-2xl font-bold text-blue-900">2</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Usuários</p>
                    <p className="text-2xl font-bold text-green-900">3</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Questionários</p>
                    <p className="text-2xl font-bold text-purple-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <Building className="h-5 w-5 inline mr-2" />
                  Gerenciar Empresas
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  <Users className="h-5 w-5 inline mr-2" />
                  Gerenciar Usuários
                </button>
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  <BarChart3 className="h-5 w-5 inline mr-2" />
                  Ver Relatórios
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default GlobalAdminDashboard







