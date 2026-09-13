import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    classe,
    etablissements,
    etablissementUtilisateur,
    estSuperAdmin,
    anneeActive,
    cycles,
    niveaux,
    series,
    maquettes,
}) {
    /*
    |--------------------------------------------------------------------------
    | Extraction du suffixe
    |--------------------------------------------------------------------------
    */

    const prefixes = [
        "6ème",
        "5ème",
        "4ème",
        "3ème",
        "2nde",
        "1ère",
        "Tle",
    ];

    let suffixe = "";

    if (classe?.libelle) {

        const prefixeTrouve =
            prefixes.find(
                (prefixe) =>
                    classe.libelle.startsWith(
                        prefixe,
                    ),
            );

        if (prefixeTrouve) {

            suffixe =
                classe.libelle
                    .substring(
                        prefixeTrouve.length,
                    )
                    .trim();
        }
    }

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({

        etablissement_id:
            classe?.etablissement_id || "",

        annee_scolaire_id:
            classe?.annee_scolaire_id || "",

        cycle_id:
            classe?.cycle_id || "",

        niveau_id:
            classe?.niveau_id || "",

        serie_id:
            classe?.serie_id || "",

        maquette_id:
            classe?.maquette_id || "",

        suffixe,

        libelle:
            classe?.libelle || "",

        capacite:
            classe?.capacite || 60,

        active:
            Boolean(classe?.active),
    });

    function submit(e) {

        e.preventDefault();

        put(
            route(
                "classes.update",
                classe.id,
            ),
        );
    }

    return (
        <AdminLayout>

            <Head title="Modifier une classe" />

            <div className="max-w-4xl mx-auto">

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    p-8
                ">

                    <h1 className="
                        text-3xl
                        font-bold
                        mb-8
                    ">
                        Modifier la classe
                    </h1>

                    <Form
                        data={data}
                        setData={setData}

                        etablissements={
                            Array.isArray(
                                etablissements,
                            )
                                ? etablissements
                                : []
                        }

                        etablissementUtilisateur={
                            etablissementUtilisateur
                        }

                        estSuperAdmin={
                            Boolean(
                                estSuperAdmin,
                            )
                        }

                        anneeActive={
                            anneeActive
                        }

                        cycles={
                            Array.isArray(cycles)
                                ? cycles
                                : []
                        }

                        niveaux={
                            Array.isArray(niveaux)
                                ? niveaux
                                : []
                        }

                        series={
                            Array.isArray(series)
                                ? series
                                : []
                        }

                        maquettes={
                            Array.isArray(maquettes)
                                ? maquettes
                                : []
                        }

                        errors={errors}

                        processing={
                            processing
                        }

                        submit={submit}

                        submitLabel="
                            Mettre à jour
                        "
                    />

                </div>

            </div>

        </AdminLayout>
    );
}