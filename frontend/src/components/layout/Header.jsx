import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth/AuthProvider'
import api from '../../services/api'
import SmartFlowLogo from '../common/SmartFlowLogo'
import LanguageSwitcher from '../common/LanguageSwitcher'

const labelMap = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/suppliers': 'Suppliers',
  '/inventory': 'Inventory',
  '/orders': 'Purchase Orders',
  '/billing': 'Billing',
  '/sales': 'Sales History',
  '/notifications': 'Notifications',
  '/reports': 'Reports',
  '/profile': 'Profile',
  '/settings': 'Settings'
}

function getTypeMeta(type) {
  const t = type?.toUpperCase() || ''
  if (t === 'WARNING') return { icon: '⚠️', bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }
  if (t === 'SALE' || t === 'INVOICE') return { icon: '🧾', bg: 'rgba(16, 185, 129, 0.15)', color: '#059669' }
  if (t === 'INVENTORY') return { icon: '📦', bg: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }
  if (t === 'AI') return { icon: '🤖', bg: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed' }
  if (t === 'SUCCESS') return { icon: '✅', bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }
  return { icon: '🔔', bg: 'rgba(99, 102, 241, 0.15)', color: '#4f46e5' }
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now'
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}

export default function Header({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const menuRef = useRef(null)
  const notificationRef = useRef(null)

  const pathKeyMap = {
    '/': 'dashboard',
    '/products': 'products',
    '/categories': 'categories',
    '/suppliers': 'suppliers',
    '/inventory': 'inventory',
    '/orders': 'orders',
    '/billing': 'billing',
    '/sales': 'sales',
    '/notifications': 'notifications',
    '/reports': 'reports',
    '/profile': 'profile',
    '/settings': 'settings'
  };
  const currentKey = pathKeyMap[location.pathname] || 'dashboard';
  const pageLabel = t(`nav.${currentKey}`, labelMap[location.pathname] || 'Dashboard');

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await api.get('/notifications')
        setNotifications(response.data)
      } catch (err) {
        console.error('Failed to load header notifications', err)
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const handleClearAll = async () => {
    try {
      const promises = notifications.filter(n => !n.read).map(n => api.put(`/notifications/${n.id}/read`))
      await Promise.all(promises)
      setNotifications([])
    } catch (err) {
      console.error('Failed to clear notifications', err)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          className="sidebar-trigger"
          title="Open Menu"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        <div className="topbar-left">
          <div>
            <p className="eyebrow">Operations Hub</p>
            <h1>{pageLabel}</h1>
          </div>
          <div className="breadcrumb">Home / {pageLabel}</div>
        </div>
      </div>
      
      <div className="topbar-middle">
        <SmartFlowLogo fontSize="1.4rem" />
      </div>

      <div className="topbar-tools">
        <button type="button" className="icon-btn" onClick={() => setDarkMode((value) => !value)}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div 
          ref={notificationRef}
          className="notification-container"
        >
          <button type="button" className="icon-btn notification-btn" onClick={() => setNotificationsOpen((value) => !value)}>
            🔔{unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
          </button>
          {notificationsOpen ? (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3>Recent Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="unread-badge-pill">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button type="button" className="mark-all-btn" onClick={handleClearAll}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-panel-list" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="notification-empty" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>🔔</span>
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>No unread notifications</p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const meta = getTypeMeta(item.type)
                    return (
                      <div
                        key={item.id}
                        className={`notification-dropdown-item${item.read ? ' read' : ''}`}
                        onClick={() => handleMarkRead(item.id)}
                      >
                        <div
                          className="notification-icon-box"
                          style={{ backgroundColor: meta.bg }}
                        >
                          {meta.icon}
                        </div>
                        <div className="notification-dropdown-item-content">
                          <div className="notification-item-top">
                            <strong className="notification-title" style={{ fontWeight: item.read ? '600' : '700' }}>
                              {item.title}
                            </strong>
                            <small className="notification-time">
                              {formatRelativeTime(item.created_at || item.createdAt)}
                            </small>
                          </div>
                          <p className="notification-msg">{item.message}</p>
                        </div>
                        {!item.read && <span className="unread-dot" />}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="notification-panel-footer">
                <Link
                  to="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="view-all-link"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          ) : null}
        </div>
        <div 
          ref={menuRef}
          className="user-menu"
        >
          <button type="button" className="user-chip" onClick={() => setMenuOpen((value) => !value)}>
            <span className="avatar">{user?.name ?.split(" ").map((word) => word[0]).join("").toUpperCase() || "S"}</span>
           <div className="user-info">
              <span className="user-name">
              {user?.name || "User"}
              </span>
              <small className="user-role">
              {user?.role}
              </small>
            </div>
          </button>
          {menuOpen ? (
            <div className="user-menu-panel">
            <Link
              to="/profile"
              className="menu-link"
              onClick={()=>setMenuOpen(false)}
            >

              My Profile

            </Link>

            <Link
              to="/settings"
              className="menu-link"
              onClick={()=>setMenuOpen(false)}
            >

              Settings

            </Link>
            <button
              type="button"
              className="menu-link menu-link-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
