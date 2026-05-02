import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'

import PropertyListPage from '@/pages/properties/PropertyListPage'
import MyPropertiesPage from '@/pages/properties/MyPropertiesPage'
import PropertyDetailPage from '@/pages/properties/PropertyDetailPage'
import PropertyFormPage from '@/pages/properties/PropertyFormPage'

import TenancyListPage from '@/pages/tenancies/TenancyListPage'
import TenancyDetailPage from '@/pages/tenancies/TenancyDetailPage'
import TenancyFormPage from '@/pages/tenancies/TenancyFormPage'

import InspectionListPage from '@/pages/inspections/InspectionListPage'
import InspectionDetailPage from '@/pages/inspections/InspectionDetailPage'
import InspectionFormPage from '@/pages/inspections/InspectionFormPage'

function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </>
  )
}

function RootRedirect() {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <RootRedirect /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: 'properties',
        element: <ProtectedRoute><PropertyListPage /></ProtectedRoute>,
      },
      {
        path: 'properties/my',
        element: <ProtectedRoute roles={['Landlord']}><MyPropertiesPage /></ProtectedRoute>,
      },
      {
        path: 'properties/new',
        element: <ProtectedRoute roles={['Landlord']}><PropertyFormPage /></ProtectedRoute>,
      },
      {
        path: 'properties/:id',
        element: <ProtectedRoute><PropertyDetailPage /></ProtectedRoute>,
      },
      {
        path: 'properties/:id/edit',
        element: <ProtectedRoute roles={['Landlord', 'Admin']}><PropertyFormPage /></ProtectedRoute>,
      },
      {
        path: 'tenancies',
        element: <ProtectedRoute roles={['Landlord', 'Tenant', 'Admin']}><TenancyListPage /></ProtectedRoute>,
      },
      {
        path: 'tenancies/new',
        element: <ProtectedRoute roles={['Tenant']}><TenancyFormPage /></ProtectedRoute>,
      },
      {
        path: 'tenancies/:id',
        element: <ProtectedRoute roles={['Landlord', 'Tenant', 'Admin']}><TenancyDetailPage /></ProtectedRoute>,
      },
      {
        path: 'inspections',
        element: <ProtectedRoute roles={['Landlord', 'Inspector', 'Admin', 'Tenant']}><InspectionListPage /></ProtectedRoute>,
      },
      {
        path: 'inspections/new',
        element: <ProtectedRoute roles={['Landlord', 'Admin', 'Tenant']}><InspectionFormPage /></ProtectedRoute>,
      },
      {
        path: 'inspections/:id',
        element: <ProtectedRoute roles={['Landlord', 'Inspector', 'Admin', 'Tenant']}><InspectionDetailPage /></ProtectedRoute>,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
