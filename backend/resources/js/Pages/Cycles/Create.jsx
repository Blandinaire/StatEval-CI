import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import Form from "./Form";

export default function Create() {
    return (
        <AdminLayout>
            <Head title="Nouveau cycle" />

            <div className="max-w-3xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Nouveau cycle
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Créer un nouveau cycle pédagogique
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow p-8">
                    <Form />
                </div>

            </div>
        </AdminLayout>
    );
}