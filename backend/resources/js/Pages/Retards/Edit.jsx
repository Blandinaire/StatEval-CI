import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    retard,
    eleves = [],
    educateurs = [],
    anneesScolaires = [],
    classes = [],
    etablissements = [],
    isSuperAdmin = false,
    etablissementId = null,
}) {
    /*
    |--------------------------------------------------------------------------
    | Préparation de la date
    |--------------------------------------------------------------------------
    */

    const dateRetard = retard?.date_retard
        ? String(retard.date_retard).substring(0, 10)
        : "";

    /*
    |--------------------------------------------------------------------------
    | Formulaire
    |--------------------------------------------------------------------------
    */

    const { data, setData, put, processing, errors } = useForm({
        etablissement_id:
            etablissementId ?? retard?.classe?.etablissement_id ?? "",

        eleve_id: retard?.eleve_id ?? "",

        educateur_id: retard?.educateur_id ?? "",

        annee_scolaire_id: retard?.annee_scolaire_id ?? "",

        classe_id: retard?.classe_id ?? "",

        date_retard: dateRetard,

        heure_prevue: retard?.heure_prevue
            ? String(retard.heure_prevue).substring(0, 5)
            : "",

        heure_arrivee: retard?.heure_arrivee
            ? String(retard.heure_arrivee).substring(0, 5)
            : "",

        duree_minutes: retard?.duree_minutes ?? 0,

        motif: retard?.motif ?? "",

        numero_billet: retard?.numero_billet ?? "",

        billet_edite: retard?.billet_edite ?? false,

        billet_edite_le: retard?.billet_edite_le ?? "",

        observation: retard?.observation ?? "",
    });

    /*
    |--------------------------------------------------------------------------
    | Soumission
    |--------------------------------------------------------------------------
    */

    function submit(e) {
        e.preventDefault();

        put(route("retards.update", retard.id));
    }

    return (
        <AdminLayout>
            <Head title="Modifier le retard" />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                            Modifier le retard
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Modification du retard n°{" "}
                            <span className="font-semibold">
                                {retard?.numero_billet ?? retard?.id}
                            </span>
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
                        submitLabel="Enregistrer les modifications"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
