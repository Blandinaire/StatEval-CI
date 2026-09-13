import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({ niveau }) {
    const { data, setData, put, processing, errors } = useForm({
        libelle: niveau?.libelle ?? "",
        code: niveau?.code ?? "",
        ordre: niveau?.ordre ?? "",
    });

    function submit(e) {
        e.preventDefault();

        put(route("niveaux.update", niveau.id));
    }

    return (
        <AdminLayout>
            <Head title={`Modifier ${niveau?.libelle ?? "le niveau"}`} />

            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Modifier le niveau
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Modifiez les informations du niveau scolaire{" "}
                        <span className="font-semibold">
                            {niveau?.libelle}
                        </span>
                        .
                    </p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <Form
                        data={data}
                        setData={setData}
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