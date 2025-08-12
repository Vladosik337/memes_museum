export interface ExhibitionsTabsProps {
  exhibitions?: { id: number; title: string; status: string }[];
  onSelect: (id: number) => void;
  onCreate: () => void;
  onArchive: (id: number) => void;
  onUnarchive?: (id: number) => void;
  activeId: number | null;
  showCreate?: boolean;
}

export default function ExhibitionsTabs({
  exhibitions = [],
  onSelect,
  onCreate,
  onArchive,
  onUnarchive,
  activeId,
  showCreate = true,
}: ExhibitionsTabsProps) {
  return (
    <div className="flex items-center mb-8 space-x-2">
      <div className="flex flex-wrap gap-2">
        {exhibitions.map((exh) => (
          <div key={exh.id} className="flex items-stretch">
            <button
              className={`px-4 py-2 rounded-l-lg font-medium transition-colors border border-r-0 ${
                activeId === exh.id
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-orange-100 hover:text-orange-700"
              }`}
              onClick={() => onSelect(exh.id)}
            >
              {exh.title || `#${exh.id}`}
            </button>
            <button
              className={`px-3 py-2 rounded-r-lg border border-l-0 font-medium transition-colors ${
                activeId === exh.id
                  ? "bg-orange-500 text-white border-orange-600 hover:bg-orange-600"
                  : "bg-gray-100 text-gray-500 border-gray-300 hover:bg-orange-100 hover:text-orange-700"
              }`}
              title={exh.status === "archived" ? "Розархівувати" : "Архівувати"}
              onClick={() =>
                exh.status === "archived"
                  ? onUnarchive?.(exh.id)
                  : onArchive(exh.id)
              }
            >
              {exh.status === "archived" ? "♻️" : "🗄️"}
            </button>
          </div>
        ))}
      </div>
      {showCreate && (
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold ml-2 border border-gray-300"
          onClick={onCreate}
        >
          + Створити нову
        </button>
      )}
    </div>
  );
}
