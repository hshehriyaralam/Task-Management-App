import TodoOverlay from "./todoOverlay";

export default function CardOverlay({ todo, cat }: any) {
  return (
    <div className="bg-white ">
      <div className="w-[350px] rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-xl text-gray-800">
            {cat?.title?.toUpperCase()}
          </h2>
        </div>

        {/* Body */}
        <div className="h-[380px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">

            {todo.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No tasks yet
              </div>
            ) : (
              todo.map((t: any) => (
                <TodoOverlay key={t.id}>
                  {t.task}
                </TodoOverlay>
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
}