import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    enseignant,
    etablissements,
    matieres,
}) {

    const { data, setData, put, processing, errors } = useForm({

    etablissement_id: enseignant.etablissement_id ?? "",

    matiere_principale_id: enseignant.matiere_principale_id ?? "",

    matiere_secondaire_id: enseignant.matiere_secondaire_id ?? "",

    nom: enseignant.nom ?? "",

    prenoms: enseignant.prenoms ?? "",

    sexe: enseignant.sexe ?? "Masculin",

    date_naissance: enseignant.date_naissance ?? "",

    lieu_naissance: enseignant.lieu_naissance ?? "",

    nationalite: enseignant.nationalite ?? "",

    telephone: enseignant.telephone ?? "",

    email: enseignant.email ?? "",

    adresse: enseignant.adresse ?? "",

    matricule: enseignant.matricule ?? "",

    matricule_fonction_publique:
        enseignant.matricule_fonction_publique ?? "",

    type: enseignant.type ?? "Vacataire",

    grade: enseignant.grade ?? "",

    diplome: enseignant.diplome ?? "",

    date_embauche: enseignant.date_embauche ?? "",

    date_prise_service:
        enseignant.date_prise_service ?? "",

    volume_horaire:
        enseignant.volume_horaire ?? 0,

    nb_classes_max:
        enseignant.nb_classes_max ?? 10,

    statut: enseignant.statut ?? "Actif",

    actif: enseignant.actif ?? true,

});

    function submit(e) {

        e.preventDefault();

        put(route("enseignants.update", enseignant.id));

    }

    return (

        <AdminLayout>

            <Head title="Modifier un enseignant" />

            <div className="max-w-5xl mx-auto">

                <div className="bg-white rounded-xl shadow p-8">

                    <h1 className="text-3xl font-bold mb-8">
                        Modifier un enseignant
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        matieres={matieres}
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