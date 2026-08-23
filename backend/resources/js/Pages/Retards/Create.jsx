import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    eleves,
    educateurs,
    anneesScolaires,
    classes,
}) {
    const { data, setData, post, processing, errors } = useForm({
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

            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-2 text-3xl font-bold">
                        Enregistrer un retard
                    </h1>

                    <p className="mb-8 text-gray-500">
                        Enregistrement d'un retard d'élève
                    </p>

                    <Form
                        data={data}
                        setData={setData}
                        eleves={eleves}
                        educateurs={educateurs}
                        anneesScolaires={anneesScolaires}
                        classes={classes}
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