import { ContentItemListItem } from "./ContentItemListItem.tsx";

interface ContentItem {
  id: string;
  name: string;
}

interface ContentItemListProps {
  items: ContentItem[];
  onAssignItem: (id: string) => void;
}

export function ContentItemList({ items, onAssignItem }: ContentItemListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No unassigned content items</div>
        <div className="text-gray-400 text-sm">All items have been assigned or there are no items to display.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unassigned Content Items</h2>
        <p className="text-gray-600">
          {items.length} {items.length === 1 ? 'item' : 'items'} waiting to be assigned
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <ContentItemListItem
            key={item.id}
            id={item.id}
            name={item.name}
            onAssign={onAssignItem}
          />
        ))}
      </div>
    </div>
  );
} 