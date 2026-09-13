import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Create({
    etablissements,
    etablissementUtilisateur,
    estSuperAdmin,
    anneeActive,
    cycles,
    niveaux,
    series,
    maquettes,
}) {
    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: estSuperAdmin
            ? ""
            : etablissementUtilisateur?.id || "",

        annee_scolaire_id: anneeActive?.id || "",

        cycle_id: "",
        niveau_id: "",
        serie_id: "",
        maquette_id: "",

        suffixe: "",

        libelle: "",
        capacite: 60,
        active: true,
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
                    <h1 className="text-3xl font-bold mb-2">
                        Nouvelle classe
                    </h1>

                    {anneeActive && (
                        <p className="text-gray-500 mb-8">
                            Création d'une classe pour l'année scolaire active :
                            {" "}
                            <span className="font-semibold text-blue-600">
                                {anneeActive.libelle}
                            </span>
                        </p>
                    )}

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        etablissementUtilisateur={
                            etablissementUtilisateur
                        }
                        estSuperAdmin={estSuperAdmin}
                        anneeActive={anneeActive}
                        cycles={cycles}
                        niveaux={niveaux}
                        series={series}
                        maquettes={maquettes}
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