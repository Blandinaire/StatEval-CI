import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create() {

    const { data, setData, post, processing, errors } = useForm({
        libelle: "",
        code: "",
        coefficient: 1,
        couleur: "#2563EB",
        active: true,
    });

    function submit(e) {
        e.preventDefault();

        post(route("matieres.store"));
    }

    return (
        <AdminLayout>

            <Head title="Nouvelle matière" />

            <div className="mx-auto max-w-4xl">

                <div className="rounded-xl bg-white p-8 shadow">

                    <h1 className="mb-8 text-3xl font-bold">
                        Nouvelle matière
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