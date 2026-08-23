import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    conduite,
    eleves,
    educateurs,
    anneesScolaires,
    classes,
    evaluations,
}) {
    const { data, setData, put, processing, errors } = useForm({
        eleve_id: conduite.eleve_id ?? "",
        educateur_id: conduite.educateur_id ?? "",
        annee_scolaire_id: conduite.annee_scolaire_id ?? "",
        classe_id: conduite.classe_id ?? "",
        evaluation_id: conduite.evaluation_id ?? "",
        note: conduite.note ?? "",
        observation: conduite.observation ?? "",
    });

    function submit(e) {
        e.preventDefault();

        put(route("conduites.update", conduite.id));
    }

    return (
        <AdminLayout>
            <Head title="Modifier une note de conduite" />

            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <h1 className="mb-8 text-3xl font-bold">
                        Modifier une note de conduite
                    </h1>

                    <Form
                        data={data}
                        setData={setData}
                        eleves={eleves}
                        educateurs={educateurs}
                        anneesScolaires={anneesScolaires}
                        classes={classes}
                        evaluations={evaluations}
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