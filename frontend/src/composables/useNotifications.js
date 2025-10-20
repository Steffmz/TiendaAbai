
import { ref } from 'vue';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/notificaciones`;
const getAuthHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
});

const unreadCount = ref(0);

export function useNotifications() {
  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/unread-count`, getAuthHeaders());
      unreadCount.value = data.count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      unreadCount.value = 0;
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount.value === 0) return;
    try {
      await axios.post(`${API_URL}/mark-as-read`, {}, getAuthHeaders());
      unreadCount.value = 0;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return {
    unreadCount,
    fetchUnreadCount,
    markAllAsRead,
  };
}