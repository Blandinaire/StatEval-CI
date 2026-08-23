import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import Form from "./Form";

export default function Edit({
    eleve,
    etablissements,
    annees,
    classes,
}) {
    /*
    |--------------------------------------------------------------------------
    | Détermination du tuteur légal
    |--------------------------------------------------------------------------
    |
    | L'ancien système peut avoir enregistré :
    | - type_tuteur = Père / Mère / Autre
    | - type_tuteur_legal = PERE / MERE / AUTRE
    |
    | On prend donc en priorité type_tuteur.
    |
    */

    const typeTuteur =
        eleve.type_tuteur ??
        ({
            PERE: "Père",
            MERE: "Mère",
            AUTRE: "Autre",
        }[eleve.type_tuteur_legal] ?? "");

    const { data, setData, put, processing, errors } = useForm({
        /*
        |--------------------------------------------------------------------------
        | SCOLARITÉ
        |--------------------------------------------------------------------------
        */

        etablissement_id: eleve.etablissement_id ?? "",
        annee_scolaire_id: eleve.annee_scolaire_id ?? "",
        classe_id: eleve.classe_id ?? "",

        /*
        |--------------------------------------------------------------------------
        | IDENTIFICATION
        |--------------------------------------------------------------------------
        */

        matricule: eleve.matricule ?? "",

        nom: eleve.nom ?? "",
        prenoms: eleve.prenoms ?? "",
        sexe: eleve.sexe ?? "",

        date_naissance: eleve.date_naissance
            ? String(eleve.date_naissance).substring(0, 10)
            : "",

        lieu_naissance: eleve.lieu_naissance ?? "",
        nationalite: eleve.nationalite ?? "Ivoirienne",
        photo: eleve.photo ?? "",

        /*
        |--------------------------------------------------------------------------
        | COORDONNÉES
        |--------------------------------------------------------------------------
        */

        adresse: eleve.adresse ?? "",
        telephone: eleve.telephone ?? "",
        email: eleve.email ?? "",

        /*
        |--------------------------------------------------------------------------
        | SITUATION SCOLAIRE
        |--------------------------------------------------------------------------
        */

        redoublant: Boolean(eleve.redoublant),
        boursier: Boolean(eleve.boursier),

        regime: eleve.regime ?? "Externe",
        statut: eleve.statut ?? "Actif",

        statut_affectation:
            eleve.statut_affectation ?? "AFFECTÉ",

        /*
        |--------------------------------------------------------------------------
        | PÈRE
        |--------------------------------------------------------------------------
        */

        pere_nom: eleve.pere_nom ?? "",
        pere_prenoms: eleve.pere_prenoms ?? "",
        pere_telephone: eleve.pere_telephone ?? "",
        pere_email: eleve.pere_email ?? "",
        pere_profession: eleve.pere_profession ?? "",
        pere_adresse: eleve.pere_adresse ?? "",

        /*
        |--------------------------------------------------------------------------
        | MÈRE
        |--------------------------------------------------------------------------
        */

        mere_nom: eleve.mere_nom ?? "",
        mere_prenoms: eleve.mere_prenoms ?? "",
        mere_telephone: eleve.mere_telephone ?? "",
        mere_email: eleve.mere_email ?? "",
        mere_profession: eleve.mere_profession ?? "",
        mere_adresse: eleve.mere_adresse ?? "",

        /*
        |--------------------------------------------------------------------------
        | TUTEUR LÉGAL
        |--------------------------------------------------------------------------
        */

        type_tuteur: typeTuteur,

        tuteur_nom: eleve.tuteur_nom ?? "",
        tuteur_prenoms: eleve.tuteur_prenoms ?? "",
        tuteur_telephone: eleve.tuteur_telephone ?? "",
        tuteur_email: eleve.tuteur_email ?? "",
        tuteur_profession: eleve.tuteur_profession ?? "",
        tuteur_adresse: eleve.tuteur_adresse ?? "",

        /*
        |--------------------------------------------------------------------------
        | RESPONSABLE LÉGAL
        |--------------------------------------------------------------------------
        |
        | Ces champs sont conservés dans le formulaire car ils existent
        | dans la base. Le contrôleur les synchronisera automatiquement.
        |
        */

        responsable_nom: eleve.responsable_nom ?? "",
        responsable_prenoms: eleve.responsable_prenoms ?? "",
        responsable_telephone: eleve.responsable_telephone ?? "",
        responsable_email: eleve.responsable_email ?? "",
        responsable_profession: eleve.responsable_profession ?? "",
        responsable_adresse: eleve.responsable_adresse ?? "",

        /*
        |--------------------------------------------------------------------------
        | INFORMATIONS MÉDICALES
        |--------------------------------------------------------------------------
        */

        groupe_sanguin: eleve.groupe_sanguin ?? "",
        allergies: eleve.allergies ?? "",
        observations_medicales:
            eleve.observations_medicales ?? "",

        contact_urgence_nom:
            eleve.contact_urgence_nom ?? "",

        contact_urgence_telephone:
            eleve.contact_urgence_telephone ?? "",

        /*
        |--------------------------------------------------------------------------
        | STATUT SYSTÈME
        |--------------------------------------------------------------------------
        */

        actif: Boolean(eleve.actif),
    });

    function submit(e) {
        e.preventDefault();

        put(route("eleves.update", eleve.id));
    }

    return (
        <AdminLayout>
            <Head
                title={`Modifier l'élève - ${eleve.nom} ${eleve.prenoms}`}
            />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            Modifier l'élève
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Modification de la fiche de{" "}
                            <span className="font-semibold text-gray-700">
                                {eleve.nom} {eleve.prenoms}
                            </span>
                        </p>

                        {eleve.code_eleve && (
                            <p className="mt-1 text-sm text-gray-500">
                                Code interne :{" "}
                                <span className="font-semibold">
                                    {eleve.code_eleve}
                                </span>
                            </p>
                        )}
                    </div>

                    <Form
                        data={data}
                        setData={setData}
                        etablissements={etablissements}
                        annees={annees}
                        classes={classes}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Enregistrer les modifications"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}