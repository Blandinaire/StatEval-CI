import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">

            <Sidebar />

            <div className="flex-1">

                <Header />

                <main className="p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}