import Header from "@/components/header";
import TodoHome from "@/app/pages/home";
import { AppProvider } from "@/context/AppContext";
import { getUserData } from "@/app/lib/helper/getData";
import WrapperComponent from "@/components/Wrapper";

export default async function Page() {
   const data = await getUserData();

  return (
    <AppProvider value={data}>
      <WrapperComponent />
    </AppProvider>
  );
}
