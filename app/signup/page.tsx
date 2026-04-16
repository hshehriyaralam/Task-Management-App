import SignUpForm from "@/components/signup"
import { cookies } from "next/headers";



export default async function SignUpPage(){
   const cookieStore = await cookies();
    const accessToken = cookieStore.get(
    "sb-xilzbhrcplvgwljkwtsb-auth-token",
  )?.value;
    return(
        <section className="flex min-h-svh w-full items-center justify-center p-6 md:p-6  font-quicksand">
      <div className="w-full max-w-sm">
        <SignUpForm  accessToken={accessToken}   />
      </div>
      </section>
    )
}