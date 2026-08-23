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
        // Informations principales
        eleve_id: "",
        educateur_id: "",
        annee_scolaire_id: "",
        classe_id: "",

        // Date et durée
        date_absence: "",
        heure_debut: "",
        heure_fin: "",
        duree_heures: "",

        // Justification
        justifiee: false,
        motif: "",

        // Billet
        numero_billet: "",
        billet_edite: false,
        billet_edite_le: "",

        // Observation
        observation: "",
    });

    function submit(e) {
        e.preventDefault();

        post(route("absences.store"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle absence" />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-8 text-3xl font-bold">
                        Enregistrer une absence
                    </h1>

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
                        submitLabel="Enregistrer l'absence"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}