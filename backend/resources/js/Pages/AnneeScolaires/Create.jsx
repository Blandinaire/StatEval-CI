import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        libelle: "",
        date_debut: "",
        date_fin: "",
        active: false,
        mode_periodes: "trimestriel",
        periodes: [
            {
                libelle: "1er trimestre",
                ordre: 1,
                date_debut: "",
                date_fin: "",
                actif: true,
            },
            {
                libelle: "2e trimestre",
                ordre: 2,
                date_debut: "",
                date_fin: "",
                actif: true,
            },
            {
                libelle: "3e trimestre",
                ordre: 3,
                date_debut: "",
                date_fin: "",
                actif: true,
            },
        ],
    });

    function submit(e) {
        e.preventDefault();

        post(route("annee-scolaires.store"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle année scolaire" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow p-8">
                    <h1 className="text-3xl font-bold mb-8 text-gray-800">
                        Nouvelle année scolaire
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
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
