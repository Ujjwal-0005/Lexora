import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <main className="min-h-[calc(100vh-64px-300px)]">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
