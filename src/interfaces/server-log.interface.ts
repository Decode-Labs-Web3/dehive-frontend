export interface AuditLogItem {
  _id: string;
  server_id: string;
  actor: {
    _id: string;
    username: string;
    display_name: string;
    avatar: string;
  };
  action: string;
  message: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}
