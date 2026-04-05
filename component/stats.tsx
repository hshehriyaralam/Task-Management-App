import { CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function Stats({todos}:any) {
  const totalTasks = todos.length
  const completedTasks = todos.filter((t:any) => t.is_complete).length
  const pendingTasks = totalTasks - completedTasks



  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ">
      {/* Total Task  */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-gray-500 text-sm ">
              Total Task
            </p>
            <p className="text-2xl font-bold text-gray-800 ">{totalTasks}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Complete Task */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm ">Complete Task</p>
            <p className="text-2xl font-bold text-gray-800 ">{completedTasks}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Pending Task */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm ">Pending Task</p>
            <p className="text-2xl font-bold text-gray-800 ">{pendingTasks}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
