import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

import Form from "./Form";

export default function Create({ cycles }) {
    return (
        <AdminLayout>
            <Head title="Nouvelle série" />

            <div className="space-y-6">

                <div className="flex items-start justify-between gap-4">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Nouvelle série
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Ajoutez une nouvelle série d'enseignement.
                        </p>
                    </div>

                    <Link
                        href={route("series.index")}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </Link>

                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <Form cycles={cycles} />
                </div>

            </div>
        </AdminLayout>
    );
}