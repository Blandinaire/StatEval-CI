import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create() {

    const { data, setData, post, processing, errors } = useForm({
        libelle: "",
        code: "",
        ordre: "",
    });

    function submit(e) {
        e.preventDefault();

        post(route("niveaux.store"));
    }

    return (
        <AdminLayout>

            <Head title="Nouveau niveau" />

            <div className="max-w-4xl mx-auto">

                <div className="bg-white rounded-xl shadow p-8">

                    <h1 className="text-3xl font-bold mb-8">
                        Nouveau niveau scolaire
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