import Link from "next/link";
import { AuthButton } from "../auth-button";
import { ThemeSwitcher } from "../theme-switcher";

type Props = {
  children: React.ReactNode;
};

const BaseLayout = ({ children }: Props) => {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full  flex flex-col  items-center">

       <Navigation />

        <main className="w-full  flex-1 flex flex-col gap-20 max-w-5xl ">
          {children}
        </main>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>Copyright @ {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  );
};

export default BaseLayout;


const Navigation = () => {

  return (
     <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Home</Link>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
              </div>
            </div>
            <AuthButton />
          </div>
        </nav>
  )
}
