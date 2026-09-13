import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    etablissements,
    annees,
    classes,
    matieres,
    enseignants,
    isSuperAdmin,
    etablissementId,
}) {
    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: isSuperAdmin
            ? ""
            : String(etablissementId ?? ""),

        annee_scolaire_id: "",

        classe_id: "",

        matiere_id: "",

        enseignant_id: "",

        coefficient: 1,

        volume_horaire: 0,

        actif: true,
    });

    function submit(e) {
        e.preventDefault();

        post(route("affectations.store"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle affectation" />

            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow p-8">
                    <h1 className="text-3xl font-bold mb-8">
                        Nouvelle affectation
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
                        submitLabel="Créer"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}