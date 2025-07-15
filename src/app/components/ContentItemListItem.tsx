interface ContentItemListItemProps {
  id: string;
  name: string;
  onAssign: (id: string) => void;
}

export function ContentItemListItem({ id, name, onAssign }: ContentItemListItemProps) {
  return (
    <div className="flex items-center justify-between py-3 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <h3 className="text-base font-medium text-gray-900">{name}</h3>
      </div>
      <button
        type="button"
        onClick={() => onAssign(id)}
        className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      >
        Assign to me
      </button>
    </div>
  );
} 