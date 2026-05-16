import type { Item } from '../types/item';

export type AgendaGroupId = 'overdue' | 'today' | 'week' | 'later' | 'no-due';

export interface AgendaGroup {
  id: AgendaGroupId;
  title: string;
  description: string;
  items: Item[];
}

const dayInMs = 24 * 60 * 60 * 1000;

const groupMeta: Omit<AgendaGroup, 'items'>[] = [
  { id: 'overdue', title: 'Overdue', description: 'Needs attention first' },
  { id: 'today', title: 'Today', description: 'Due today' },
  { id: 'week', title: 'This week', description: 'Due in the next seven days' },
  { id: 'later', title: 'Later', description: 'Scheduled beyond this week' },
  { id: 'no-due', title: 'No due date', description: 'Open work without a date' },
];

export function groupAgendaItems(items: Item[], today = new Date()): AgendaGroup[] {
  const todayKey = toDateKey(today);
  const buckets: Record<AgendaGroupId, Item[]> = {
    overdue: [],
    today: [],
    week: [],
    later: [],
    'no-due': [],
  };

  items
    .filter((item) => item.status !== 'archived')
    .forEach((item) => {
      const groupId = getAgendaGroupId(item, todayKey);
      buckets[groupId].push(item);
    });

  return groupMeta.map((group) => ({
    ...group,
    items: buckets[group.id].sort(compareAgendaItems),
  }));
}

function getAgendaGroupId(item: Item, todayKey: string): AgendaGroupId {
  if (!item.dueDate) return 'no-due';

  const dueKey = normalizeDateKey(item.dueDate);
  if (!dueKey) return 'no-due';
  if (dueKey < todayKey && item.status !== 'done') return 'overdue';
  if (dueKey === todayKey) return 'today';

  const daysUntilDue = (dateFromKey(dueKey).getTime() - dateFromKey(todayKey).getTime()) / dayInMs;
  return daysUntilDue <= 7 ? 'week' : 'later';
}

function compareAgendaItems(left: Item, right: Item): number {
  const leftDate = left.dueDate || '9999-12-31';
  const rightDate = right.dueDate || '9999-12-31';
  if (leftDate !== rightDate) return leftDate.localeCompare(rightDate);

  return priorityRank[right.priority] - priorityRank[left.priority] || left.title.localeCompare(right.title);
}

const priorityRank: Record<Item['priority'], number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

function normalizeDateKey(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
