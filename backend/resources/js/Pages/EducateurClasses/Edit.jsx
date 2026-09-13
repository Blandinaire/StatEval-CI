import AdminLayout from "@/Layouts/AdminLayout";
import Form from "./Form";
import { Head } from "@inertiajs/react";

export default function Create({
    etablissements = [],
    anneesScolaires = [],
    educateurs = [],
    classes = [],
    isSuperAdmin = false,
    etablissementId = null,
}) {
    return (
        <AdminLayout>
            <Head title="Nouvelle affectation" />

            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Nouvelle affectation
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Affecter une classe à un éducateur.
                    </p>
                </div>

                <Form
                    etablissements={etablissements}
                    anneesScolaires={anneesScolaires}
                    educateurs={educateurs}
                    classes={classes}
                    isSuperAdmin={isSuperAdmin}
                    etablissementId={etablissementId}
                />
            </div>
        </AdminLayout>
    );
}