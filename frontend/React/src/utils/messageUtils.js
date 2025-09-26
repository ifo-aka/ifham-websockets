export const normalizeIncoming = (received) => {
  // Accept different shapes from backend / frontend and produce a superset object
  const senderPhone =
    received.senderPhone || received.from || received.sender || null;
  const receiverPhone =
    received.receiverPhone || received.to || received.receiver || null;
  
  const ts = received.timeStamp || received.timestamp || received.ts || null;
  let isoTimestamp;

  if (ts && typeof ts === 'object' && ts.seconds !== undefined && ts.nanos !== undefined) {
    // Handle Spring Boot Instant object { seconds, nanos }
    isoTimestamp = new Date(ts.seconds * 1000 + ts.nanos / 1000000).toISOString();
  } else if (ts) {
    // Assume it's already a parsable string or number
    const d = new Date(ts);
    // Check if the date is valid
    if (!isNaN(d.getTime())) {
      isoTimestamp = d.toISOString();
    } else {
      isoTimestamp = new Date().toISOString(); // Fallback for invalid date strings
    }
  } else {
    // Fallback to now if no timestamp is provided
    isoTimestamp = new Date().toISOString();
  }

  const normalized = {
    // keep both conventions so older components/slices still find them
    id: received.id ?? received.messageId ?? null,
    senderPhone,
    receiverPhone,
    from: received.from ?? senderPhone,
    to: received.to ?? receiverPhone,
    content: received.content ?? received.body ?? "",
    // provide both timeStamp and timestamp
    timeStamp: isoTimestamp,
    timestamp: isoTimestamp,
    status: received.status ?? "SENT",
    // keep original raw payload just in case
    _raw: received,
  };
  return normalized;
};