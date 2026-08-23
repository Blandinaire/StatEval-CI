import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    retard,
    eleves,
    educateurs,
    anneesScolaires,
    classes,
}) {
    const { data, setData, put, processing, errors } = useForm({
        eleve_id: retard.eleve_id ?? "",
        educateur_id: retard.educateur_id ?? "",
        annee_scolaire_id: retard.annee_scolaire_id ?? "",
        classe_id: retard.classe_id ?? "",
        date_retard: retard.date_retard ?? "",
        heure_prevue: retard.heure_prevue ?? "",
        heure_arrivee: retard.heure_arrivee ?? "",
        duree_minutes: retard.duree_minutes ?? 0,
        motif: retard.motif ?? "",
        numero_billet: retard.numero_billet ?? "",
        billet_edite: Boolean(retard.billet_edite),
        billet_edite_le: retard.billet_edite_le ?? "",
        observation: retard.observation ?? "",
    });

    function submit(e) {
        e.preventDefault();

        put(route("retards.update", retard.id));
    }

    return (
        <AdminLayout>
            <Head title="Modifier un retard" />

            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-2 text-3xl font-bold">
                        Modifier un retard
                    </h1>

                    <p className="mb-8 text-gray-500">
                        Modification des informations du retard
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
                        submitLabel="Mettre à jour"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}