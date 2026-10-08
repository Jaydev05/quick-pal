export type EmailHistoryEntry = {
  id: string;
  recipient: string;
  subject: string;
  sentAt: string | null;
  status: string;
  providerId: string | null;
  html: string | null;
};

export function deliveryLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: "Accepted by email service",
    sent: "Sent — delivery unconfirmed",
    delivered: "Delivered",
    failed: "Send failed",
    bounced: "Bounced",
    complained: "Spam complaint",
    pending: "Sending",
    delivery_delayed: "Delivery delayed",
    unknown: "Delivery unconfirmed",
  };
  return labels[status] ?? "Delivery unconfirmed";
}