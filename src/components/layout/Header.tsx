import { useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface HeaderProps {
  title: string
  showBack?: boolean
  showLogout?: boolean
}

export function Header({ title, showBack = false, showLogout = false }: HeaderProps) {
  const navigate = useNavigate()
  const signOut = useAuthStore((s) => s.signOut)

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        {showLogout && (
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  )
}
