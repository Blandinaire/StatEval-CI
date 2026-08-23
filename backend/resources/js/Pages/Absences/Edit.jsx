import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    absence,
    eleves,
    educateurs,
    anneesScolaires,
    classes,
}) {
    const { data, setData, put, processing, errors } = useForm({
        // Informations principales
        eleve_id: absence.eleve_id ?? "",
        educateur_id: absence.educateur_id ?? "",
        annee_scolaire_id: absence.annee_scolaire_id ?? "",
        classe_id: absence.classe_id ?? "",

        // Date et durée
        date_absence: absence.date_absence ?? "",
        heure_debut: absence.heure_debut ?? "",
        heure_fin: absence.heure_fin ?? "",
        duree_heures: absence.duree_heures ?? "",

        // Justification
        justifiee: Boolean(absence.justifiee),
        motif: absence.motif ?? "",

        // Billet
        numero_billet: absence.numero_billet ?? "",
        billet_edite: Boolean(absence.billet_edite),
        billet_edite_le: absence.billet_edite_le ?? "",

        // Observation
        observation: absence.observation ?? "",
    });

    function submit(e) {
        e.preventDefault();

        put(route("absences.update", absence.id));
    }

    return (
        <AdminLayout>
            <Head title="Modifier une absence" />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-8 text-3xl font-bold">
                        Modifier une absence
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
                        submitLabel="Mettre à jour l'absence"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}