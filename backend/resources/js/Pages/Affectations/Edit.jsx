import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    affectation,
    etablissements,
    annees,
    classes,
    matieres,
    enseignants,
    isSuperAdmin,
    etablissementId,
}) {
    const { data, setData, put, processing, errors } = useForm({
        etablissement_id:
            affectation.etablissement_id ?? "",

        annee_scolaire_id:
            affectation.annee_scolaire_id ?? "",

        classe_id:
            affectation.classe_id ?? "",

        matiere_id:
            affectation.matiere_id ?? "",

        enseignant_id:
            affectation.enseignant_id ?? "",

        coefficient:
            affectation.coefficient ?? 1,

        volume_horaire:
            affectation.volume_horaire ?? 0,

        actif:
            affectation.actif ?? true,
    });

    function submit(e) {
        e.preventDefault();

        put(
            route(
                "affectations.update",
                affectation.id
            )
        );
    }

    return (
        <AdminLayout>
            <Head title="Modifier une affectation" />

            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow p-8">
                    <h1 className="text-3xl font-bold mb-8">
                        Modifier une affectation
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        annees={annees}
                        classes={classes}
                        matieres={matieres}
                        enseignants={enseignants}
                        isSuperAdmin={isSuperAdmin}
                        etablissementId={etablissementId}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Mettre à jour"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}