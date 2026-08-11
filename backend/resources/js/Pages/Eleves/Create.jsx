import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    etablissements,
    annees,
    classes,
}) {
    const { data, setData, post, processing, errors } = useForm({

        etablissement_id: "",

        annee_scolaire_id: "",

        classe_id: "",

        matricule: "",

        nom: "",

        prenoms: "",

        sexe: "",

        date_naissance: "",

        lieu_naissance: "",

        nationalite: "Ivoirienne",

        photo: "",

        adresse: "",

        telephone: "",

        email: "",

        redoublant: false,

        boursier: false,

        regime: "Externe",

        statut: "Actif",

        responsable_nom: "",

        responsable_prenoms: "",

        responsable_telephone: "",

        responsable_email: "",

        responsable_profession: "",

        responsable_adresse: "",

        groupe_sanguin: "",

        allergies: "",

        observations_medicales: "",

        contact_urgence_nom: "",

        contact_urgence_telephone: "",

        actif: true,
    });

    function submit(e) {
        e.preventDefault();

        post(route("eleves.store"));
    }

    return (
        <AdminLayout>

            <Head title="Nouvel élève" />

            <div className="mx-auto max-w-6xl">

                <div className="rounded-xl bg-white p-8 shadow">

                    <h1 className="mb-8 text-3xl font-bold">
                        Nouvel élève
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        annees={annees}
                        classes={classes}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Créer l'élève"
                    />

                </div>

            </div>

        </AdminLayout>
    );
}