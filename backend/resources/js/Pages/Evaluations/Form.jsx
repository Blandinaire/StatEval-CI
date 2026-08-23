import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";

export default function Form() {
    return (
        <AdminLayout>
            <Head title="Nouvelle évaluation" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Nouvelle évaluation
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Création d'une nouvelle évaluation scolaire
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-green-600">
                        AdminLayout et Head fonctionnent correctement.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}