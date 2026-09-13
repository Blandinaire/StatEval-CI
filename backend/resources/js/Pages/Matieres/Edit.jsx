import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({ matiere, matieresParents = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        matiere_parent_id: matiere.matiere_parent_id ?? "",
        libelle: matiere.libelle ?? "",
        code: matiere.code ?? "",
        couleur: matiere.couleur ?? "#2563EB",
        active: Boolean(matiere.active),
    });

    function submit(e) {
        e.preventDefault();

        put(route("matieres.update", matiere.id));
    }

    return (
        <AdminLayout>
            <Head title="Modifier une matière" />

            <div className="mx-auto max-w-4xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-8 text-3xl font-bold">
                        Modifier une matière
                    </h1>

                    <Form
                        data={data}
                        matieresParents={matieresParents}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Enregistrer"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
