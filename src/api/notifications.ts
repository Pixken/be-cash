import { get, put } from "@/utils/request"
import { storage } from "@/utils/storage"
import axios from "axios"

export const getNotifications = () => {
  return axios("http://116.198.241.147:8091/api/finance/alerts", {
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": storage.getItem("user")?.id.value || "",
    },
  })
}

export const getNotificationsUnread = () => {
  return get("/finance/alerts/unread")
}

export const readNotification = (alertId: string) => {
  return put(`/finance/alerts/${alertId}/read`)
}

export const dismissNotification = (alertId: string) => {
  return put(`/finance/alerts/${alertId}/dismiss`)
}