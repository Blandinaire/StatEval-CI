import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    educateur,
    etablissements,
}) {
    const { data, setData, put, processing, errors } = useForm({
        etablissement_id: educateur.etablissement_id ?? "",

        nom: educateur.nom ?? "",
        prenoms: educateur.prenoms ?? "",
        sexe: educateur.sexe ?? "",

        date_naissance: educateur.date_naissance ?? "",
        lieu_naissance: educateur.lieu_naissance ?? "",
        nationalite: educateur.nationalite ?? "Ivoirienne",

        telephone: educateur.telephone ?? "",
        email: educateur.email ?? "",
        adresse: educateur.adresse ?? "",

        matricule: educateur.matricule ?? "",
        type: educateur.type ?? "Contractuel",
        grade: educateur.grade ?? "",
        diplome: educateur.diplome ?? "",

        date_embauche: educateur.date_embauche ?? "",
        date_prise_service:
            educateur.date_prise_service ?? "",

        statut: educateur.statut ?? "Actif",
        actif: Boolean(educateur.actif),
    });

    function submit(e) {
        e.preventDefault();

        put(route("educateurs.update", educateur.id));
    }

    return (
        <AdminLayout>
            <Head title="Modifier un éducateur" />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-8 text-3xl font-bold">
                        Modifier un éducateur
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
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