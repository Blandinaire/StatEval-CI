import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({ niveaux, annees }) {

    const { data, setData, post, processing, errors } = useForm({
        libelle: "",
        niveau_id: "",
        annee_scolaire_id: "",
        capacite: 60,
    });

    function submit(e) {
        e.preventDefault();

        post(route("classes.store"));
    }

    return (
        <AdminLayout>

            <Head title="Nouvelle classe" />

            <div className="max-w-4xl mx-auto">

                <div className="bg-white rounded-xl shadow p-8">

                    <h1 className="text-3xl font-bold mb-8">
                        Nouvelle classe
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
                        niveaux={niveaux}
                        annees={annees}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Créer"
                    />

                </div>

            </div>

        </AdminLayout>
    );
}