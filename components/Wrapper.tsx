'use client'

import TodoHome from "@/app/pages/home"
import Header from "./header"
import { useAppContext } from "@/context/AppContext";


export default function WrapperComponent(){
      const { userName, todos, categories, accessToken } = useAppContext();
    

    return(
          <section className="min-h-screen bg-gradient-to-br
             from-gray-50 via-white to-gray-50  font-quicksand">
              <div className="max-w-7xl mx-auto p-6 lg:p-4  ">
                <Header 
                isViewer={false}
                userName={userName}/>
                <TodoHome
                todos={todos}
                categories={categories}
                accessToken={accessToken}
                isViewer={false}
                boardId={null}
                />
              </div>
            </section>
    )
}