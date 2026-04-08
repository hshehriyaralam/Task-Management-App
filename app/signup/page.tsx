import SignUpForm from "@/components/signup"


export default function SignUpPage(){
    return(
        <section className="flex min-h-svh w-full items-center justify-center p-6 md:p-6  font-quicksand">
      <div className="w-full max-w-sm">
        <SignUpForm    />
      </div>
      </section>
    )
}