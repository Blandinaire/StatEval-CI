import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    eleves = [],
    educateurs = [],
    anneesScolaires = [],
    classes = [],
    etablissements = [],
    isSuperAdmin = false,
    etablissementId = null,
}) {
    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: etablissementId ?? "",
        eleve_id: "",
        educateur_id: "",
        annee_scolaire_id: "",
        classe_id: "",
        date_retard: "",
        heure_prevue: "",
        heure_arrivee: "",
        duree_minutes: 0,
        motif: "",
        numero_billet: "",
        billet_edite: false,
        billet_edite_le: "",
        observation: "",
    });

    function submit(e) {
        e.preventDefault();

        post(route("retards.store"));
    }

    return (
        <AdminLayout>
            <Head title="Enregistrer un retard" />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                            Enregistrer un retard
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Enregistrement d'un retard d'élève
                        </p>
                    </div>

                    <Form
                        data={data}
                        setData={setData}
                        eleves={eleves}
                        educateurs={educateurs}
                        anneesScolaires={anneesScolaires}
                        classes={classes}
                        etablissements={etablissements}
                        isSuperAdmin={isSuperAdmin}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Enregistrer le retard"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
