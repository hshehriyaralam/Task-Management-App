import Header from "@/components/header";
import TodoHome from "@/app/pages/home";
import { AppProvider } from "@/context/AppContext";
import { getUserData } from "@/app/lib/helper/getUserData";

export default async function Page() {
   const data = await getUserData();

  return (
    <AppProvider value={data}>
    <section className="min-h-screen bg-gradient-to-br
     from-gray-50 via-white to-gray-50  font-quicksand">
      <div className="max-w-7xl mx-auto p-6 lg:p-4  ">
        <Header/>
        <TodoHome />
      </div>
    </section>
          </AppProvider>
  );
}
