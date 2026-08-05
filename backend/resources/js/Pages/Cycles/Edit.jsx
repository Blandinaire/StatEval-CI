import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({ cycle }) {
    return (
        <AdminLayout>
            <Head title="Modifier un cycle" />

            <div className="max-w-3xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Modifier le cycle
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Modification des informations du cycle
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow p-8">
                    <Form cycle={cycle} />
                </div>

            </div>
        </AdminLayout>
    );
}