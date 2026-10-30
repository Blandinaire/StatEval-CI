import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({ annee }) {
    const { data, setData, put, processing, errors } = useForm({
        libelle: annee.libelle,
        date_debut: annee.date_debut?.substring(0, 10),
        date_fin: annee.date_fin?.substring(0, 10),
        active: annee.active,
        mode_periodes: annee.mode_periodes ?? "trimestriel",
        periodes: annee.periodes?.length
            ? annee.periodes
            : annee.mode_periodes === "semestriel"
              ? [
                    {
                        libelle: "1er semestre",
                        ordre: 1,
                        date_debut: "",
                        date_fin: "",
                        actif: true,
                    },
                    {
                        libelle: "2e semestre",
                        ordre: 2,
                        date_debut: "",
                        date_fin: "",
                        actif: true,
                    },
                ]
              : [
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

        put(route("annee-scolaires.update", annee.id));
    }

    return (
        <AdminLayout>
            <Head title="Modifier une année scolaire" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow p-8">
                    <h1 className="text-3xl font-bold mb-8">
                        Modifier une année scolaire
                    </h1>

                    <Form
                        data={data}
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
