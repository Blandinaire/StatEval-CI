import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    etablissements,
    etablissementId,
    isSuperAdmin,
    matieres,
}) {
    const { data, setData, post, processing, errors } = useForm({

        // Informations administratives
        etablissement_id: etablissementId
            ? String(etablissementId)
            : "",

        // Informations personnelles
        nom: "",
        prenoms: "",
        sexe: "",
        date_naissance: "",
        lieu_naissance: "",
        nationalite: "Ivoirienne",

        // Coordonnées
        telephone: "",
        email: "",
        adresse: "",

        // Administration
        matricule: "",
        matricule_fonction_publique: "",
        type: "Permanent",
        grade: "",
        diplome: "",

        // Pédagogie
        matiere_principale_id: "",
        matiere_secondaire_id: "",
        volume_horaire: 0,
        nb_classes_max: 10,

        // Statut
        date_embauche: "",
        date_prise_service: "",
        statut: "Actif",
        actif: true,
    });

    function submit(e) {
        e.preventDefault();

        post(route("enseignants.store"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvel enseignant" />

            <div className="max-w-6xl mx-auto">

                <div className="bg-white rounded-xl shadow p-8">

                    <h1 className="text-3xl font-bold mb-8">
                        Nouvel enseignant
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        isSuperAdmin={isSuperAdmin}
                        matieres={matieres}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Créer l'enseignant"
                    />

                </div>

            </div>
        </AdminLayout>
    );
}