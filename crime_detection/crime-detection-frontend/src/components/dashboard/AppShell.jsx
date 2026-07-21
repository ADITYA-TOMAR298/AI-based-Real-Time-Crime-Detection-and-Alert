import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
  return <div className="min-h-screen bg-slate-950 text-white"><Header /><div className="flex"><Sidebar /><main className="min-w-0 flex-1 p-5 sm:p-7 xl:px-10 xl:py-8">{children}</main></div></div>;
}
