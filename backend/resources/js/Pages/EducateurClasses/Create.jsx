import AdminLayout from "@/Layouts/AdminLayout";
import BulkForm from "./BulkForm";
import { Head } from "@inertiajs/react";

export default function Create({
    etablissements = [],
    anneesScolaires = [],
    educateurs = [],
    classes = [],
    affectationsExistantes = [],
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
                        Affecter chaque classe à son éducateur responsable.
                    </p>
                </div>

                <BulkForm
                    etablissements={etablissements}
                    anneesScolaires={anneesScolaires}
                    educateurs={educateurs}
                    classes={classes}
                    affectationsExistantes={affectationsExistantes}
                    isSuperAdmin={isSuperAdmin}
                    etablissementId={etablissementId}
                />
            </div>
        </AdminLayout>
    );
}