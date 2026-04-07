


export default function Header() {
    return (
        <header  className="">
        <div  className="flex items-center justify-between   mb-2"  >
            <div >

            <h1  className="text-4xl font-bold text-gray-800">TaskFlow</h1>
            </div>

        <div  className="flex items-center gap-2">
            <div  className="bg-white  rounded-xl px-4 py-2 shadow-sm border border-gray-100 ">
                <div className="text-xs text-gray-500">Today</div>
                <div className="text-sm font-semibold text-gray-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            </div>
        </div>
        </div>
        </header>
    )
}