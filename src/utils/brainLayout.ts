import type { Category, Item, Position } from '../types/item';

const categoryAnchors: Record<Category, Position> = {
  Company: { x: 260, y: 330 },
  Family: { x: 820, y: 360 },
  Personal: { x: 560, y: 610 },
  'Top Priority': { x: 560, y: 170 },
};

const categoryColumns: Record<Category, number> = {
  Company: 2,
  Family: 2,
  Personal: 3,
  'Top Priority': 2,
};

export function arrangeItemsInBrain(items: Item[]): Record<string, Position> {
  const positions: Record<string, Position> = {};
  const groupedItems = groupItemsByCategory(items);

  for (const [category, categoryItems] of Object.entries(groupedItems) as [Category, Item[]][]) {
    const anchor = categoryAnchors[category];
    const columns = categoryColumns[category];
    const sortedItems = [...categoryItems].sort((left, right) => left.title.localeCompare(right.title));

    sortedItems.forEach((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const centeredColumn = column - (Math.min(columns, sortedItems.length) - 1) / 2;

      positions[item.id] = {
        x: anchor.x + centeredColumn * 190,
        y: anchor.y + row * 145,
      };
    });
  }

  return positions;
}

function groupItemsByCategory(items: Item[]): Record<Category, Item[]> {
  return {
    Company: items.filter((item) => item.category === 'Company'),
    Family: items.filter((item) => item.category === 'Family'),
    Personal: items.filter((item) => item.category === 'Personal'),
    'Top Priority': items.filter((item) => item.category === 'Top Priority'),
  };
}
