// Date and time labels shared by the chat list and the conversation.

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(time: number) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function isSameDay(a: number, b: number) {
  return startOfDay(a) === startOfDay(b);
}

// "10:24", matching the 24-hour times on Home.
export function formatTime(time: number) {
  return new Date(time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// "Today", "Yesterday", or "Wed, Nov 4" between the messages.
export function formatDay(time: number, now = Date.now()) {
  const daysAgo = Math.round((startOfDay(now) - startOfDay(time)) / DAY);
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return new Date(time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
