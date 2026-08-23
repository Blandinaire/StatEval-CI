import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({ etablissements }) {
    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: "",

        nom: "",
        prenoms: "",
        sexe: "",
        date_naissance: "",
        lieu_naissance: "",
        nationalite: "Ivoirienne",

        telephone: "",
        email: "",
        adresse: "",

        matricule: "",
        type: "Contractuel",
        grade: "",
        diplome: "",

        date_embauche: "",
        date_prise_service: "",
        statut: "Actif",
        actif: true,
    });

    function submit(e) {
        e.preventDefault();

        post(route("educateurs.store"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvel éducateur" />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-8 text-3xl font-bold">
                        Nouvel éducateur
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Créer l'éducateur"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}