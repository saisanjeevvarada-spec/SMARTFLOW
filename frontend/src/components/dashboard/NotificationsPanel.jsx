import React, { useEffect, useState } from "react";
import Card from "../common/Card";
import api from "../../services/api";

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Just now'
  
  const now = new Date()
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

export default function NotificationsPanel(){
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    }
    fetchNotifications();
  }, []);

  function getIcon(type) {
    if (type?.toUpperCase() === 'WARNING') return '⚠';
    if (type?.toUpperCase() === 'SALE' || type?.toUpperCase() === 'INVOICE') return '🧾';
    if (type?.toUpperCase() === 'INVENTORY') return '📦';
    if (type?.toUpperCase() === 'AI') return '🤖';
    return '🔔';
  }

  return (
    <Card
      title="Notifications"
      subtitle="Latest alerts"
      className="panel-card"
    >
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
            No new notifications.
          </div>
        ) : (
          notifications.map((item, index) => (
            <div key={item.id || index} className="notification-item">
              <span>{getIcon(item.type)}</span>
              <div style={{ flex: 1 }}>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <small style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px', display: 'block' }}>
                  {formatRelativeTime(item.created_at || item.createdAt)}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}