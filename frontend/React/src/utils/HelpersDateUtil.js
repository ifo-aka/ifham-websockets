// ---------- Helpers ----------
const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const getRelativeDate = (isoDate) => {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString();
};

const formatLastSeen = (isoString) => {
  if (!isoString) return "Offline";
  const lastSeenDate = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const time = lastSeenDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  const lastSeenStart = new Date(lastSeenDate.getFullYear(), lastSeenDate.getMonth(), lastSeenDate.getDate());

  if (lastSeenStart.getTime() === todayStart.getTime()) {
    return `last seen today at ${time}`;
  }
  if (lastSeenStart.getTime() === yesterdayStart.getTime()) {
    return `last seen yesterday at ${time}`;
  }
  return `last seen on ${lastSeenDate.toLocaleDateString()}`;
};
export { formatTime, getRelativeDate, formatLastSeen };

