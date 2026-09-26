import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import BulkForm from "./BulkForm";

export default function Create({
    etablissements,
    annees,
    classes,
    matieres,
    enseignants,
    affectationsExistantes = [],
    isSuperAdmin,
    etablissementId,
    errors = {},
}) {
    const [processing, setProcessing] = useState(false);

    function submit(data) {
        setProcessing(true);
        router.post(route("affectations.bulk.store"), data, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle affectation" />

            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow p-8">
                    <h1 className="text-3xl font-bold mb-8">
                        Nouvelle affectation
                    </h1>

                    <BulkForm
                        etablissements={etablissements}
                        annees={annees}
                        classes={classes}
                        matieres={matieres}
                        enseignants={enseignants}
                        affectationsExistantes={affectationsExistantes}
                        isSuperAdmin={isSuperAdmin}
                        etablissementId={etablissementId}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
