import Notification from '../models/Notification.js';

/** Fan a notification out to one or many user ids. */
export async function notify(userIds, { title, message, type = 'system', link = '' }) {
  const ids = (Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean);
  if (!ids.length) return [];
  return Notification.insertMany(ids.map((user) => ({ user, title, message, type, link })));
}
