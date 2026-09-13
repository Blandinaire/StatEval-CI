import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Form({
    etablissements = [],
    annees = [],
    anneeScolaireActive = null,
    classes = [],
    matieres = [],
    enseignants = [],
    affectations = [],
}) {
    /*
    |--------------------------------------------------------------------------
    | DÉTERMINATION DU PROFIL
    |--------------------------------------------------------------------------
    */

    const userRole =
        typeof window !== "undefined"
            ? (document.body.dataset.userRole ?? "")
            : "";

    /*
    |--------------------------------------------------------------------------
    | Détection à partir des données disponibles
    |
    | Pour le professeur :
    | - un seul établissement
    | - un seul enseignant
    |
    | Pour le SuperAdmin :
    | - plusieurs établissements
    | - plusieurs enseignants
    |--------------------------------------------------------------------------
    */

    const estSuperAdmin = etablissements.length > 1 || enseignants.length > 1;

    const etablissementProfesseur = etablissements[0] ?? null;
    const enseignantProfesseur = enseignants[0] ?? null;

    /*
    |--------------------------------------------------------------------------
    | Année scolaire par défaut
    |--------------------------------------------------------------------------
    */

    const anneeParDefaut =
        anneeScolaireActive ??
        annees.find((annee) => annee.actif === true) ??
        annees[0] ??
        null;

    /*
    |--------------------------------------------------------------------------
    | FORMULAIRE
    |--------------------------------------------------------------------------
    */

    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: estSuperAdmin
            ? ""
            : (etablissementProfesseur?.id ?? ""),

        annee_scolaire_id: anneeParDefaut?.id ?? "",

        classe_id: "",

        matiere_id: "",

        enseignant_id: estSuperAdmin ? "" : (enseignantProfesseur?.id ?? ""),

        libelle: "",

        type: "Devoir",

        numero: 1,

        date: "",

        bareme: 20,

        coefficient: 1,

        periode: "",

        actif: true,
    });

    /*
    |--------------------------------------------------------------------------
    | ÉTABLISSEMENT SÉLECTIONNÉ
    |--------------------------------------------------------------------------
    */

    const etablissementSelectionne =
        etablissements.find(
            (etablissement) =>
                Number(etablissement.id) === Number(data.etablissement_id),
        ) ?? null;

    /*
    |--------------------------------------------------------------------------
    | ANNÉE SCOLAIRE SÉLECTIONNÉE
    |--------------------------------------------------------------------------
    */

    const anneeSelectionnee =
        annees.find(
            (annee) => Number(annee.id) === Number(data.annee_scolaire_id),
        ) ?? null;

    /*
    |--------------------------------------------------------------------------
    | AFFECTATIONS CORRESPONDANT À L'ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

    const affectationsEtablissement = affectations.filter(
        (affectation) =>
            !data.etablissement_id ||
            Number(affectation.etablissement_id) ===
                Number(data.etablissement_id),
    );

    /*
    |--------------------------------------------------------------------------
    | AFFECTATIONS CORRESPONDANT À L'ÉTABLISSEMENT + ANNÉE
    |--------------------------------------------------------------------------
    */

    const affectationsAnnee = affectationsEtablissement.filter(
        (affectation) =>
            !data.annee_scolaire_id ||
            Number(affectation.annee_scolaire_id) ===
                Number(data.annee_scolaire_id),
    );

    /*
    |--------------------------------------------------------------------------
    | CLASSES AUTORISÉES
    |--------------------------------------------------------------------------
    |
    | SuperAdmin :
    |   classes de l'établissement + année sélectionnés
    |
    | Professeur :
    |   classes de ses affectations
    |
    |--------------------------------------------------------------------------
    */

    const classesAutorisees = classes.filter((classe) => {
        const memeEtablissement =
            Number(classe.etablissement_id) === Number(data.etablissement_id);

        const memeAnnee =
            Number(classe.annee_scolaire_id) === Number(data.annee_scolaire_id);

        if (!memeEtablissement || !memeAnnee) {
            return false;
        }

        if (estSuperAdmin) {
            return true;
        }

        return affectationsAnnee.some(
            (affectation) =>
                Number(affectation.classe_id) === Number(classe.id) &&
                Number(affectation.enseignant_id) ===
                    Number(data.enseignant_id),
        );
    });

    /*
    |--------------------------------------------------------------------------
    | MATIÈRES AUTORISÉES
    |--------------------------------------------------------------------------
    |
    | SuperAdmin :
    |   matières disponibles dans les affectations de
    |   l'établissement + année + classe
    |
    | Professeur :
    |   uniquement ses matières affectées
    |--------------------------------------------------------------------------
    */

    const matieresAutorisees = matieres.filter((matiere) => {
        if (!data.classe_id) {
            return false;
        }

        return affectationsAnnee.some(
            (affectation) =>
                Number(affectation.classe_id) === Number(data.classe_id) &&
                Number(affectation.matiere_id) === Number(matiere.id) &&
                (estSuperAdmin ||
                    Number(affectation.enseignant_id) ===
                        Number(data.enseignant_id)),
        );
    });

    /*
    |--------------------------------------------------------------------------
    | ENSEIGNANTS AUTORISÉS
    |--------------------------------------------------------------------------
    |
    | SuperAdmin :
    |   enseignants ayant une affectation correspondant à :
    |   établissement + année + classe + matière
    |
    | Professeur :
    |   son propre enseignant
    |--------------------------------------------------------------------------
    */

    const enseignantsAutorises = enseignants.filter((enseignant) => {
        if (!estSuperAdmin) {
            return Number(enseignant.id) === Number(enseignantProfesseur?.id);
        }

        /*
        |--------------------------------------------------------------
        | Si aucune classe ou matière n'est encore sélectionnée,
        | afficher les enseignants de l'établissement.
        |--------------------------------------------------------------
        */

        if (!data.classe_id || !data.matiere_id) {
            return (
                !data.etablissement_id ||
                Number(enseignant.etablissement_id) ===
                    Number(data.etablissement_id)
            );
        }

        /*
        |--------------------------------------------------------------
        | Sinon, afficher uniquement les enseignants affectés
        | à cette classe + matière + année.
        |--------------------------------------------------------------
        */

        return affectationsAnnee.some(
            (affectation) =>
                Number(affectation.classe_id) === Number(data.classe_id) &&
                Number(affectation.matiere_id) === Number(data.matiere_id) &&
                Number(affectation.enseignant_id) === Number(enseignant.id),
        );
    });

    /*
    |--------------------------------------------------------------------------
    | SOUMISSION
    |--------------------------------------------------------------------------
    */

    const submit = (e) => {
        e.preventDefault();

        post(route("evaluations.store"));
    };

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT D'ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

    const handleEtablissementChange = (e) => {
        const etablissementId = e.target.value;

        setData((currentData) => ({
            ...currentData,
            etablissement_id: etablissementId,
            classe_id: "",
            matiere_id: "",
            enseignant_id: "",
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT D'ANNÉE
    |--------------------------------------------------------------------------
    */

    const handleAnneeChange = (e) => {
        const anneeId = e.target.value;

        setData((currentData) => ({
            ...currentData,
            annee_scolaire_id: anneeId,
            classe_id: "",
            matiere_id: "",
            enseignant_id: "",
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT DE CLASSE
    |--------------------------------------------------------------------------
    */

    const handleClasseChange = (e) => {
        const classeId = e.target.value;

        setData((currentData) => ({
            ...currentData,
            classe_id: classeId,
            matiere_id: "",
            enseignant_id: estSuperAdmin ? "" : currentData.enseignant_id,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT DE MATIÈRE
    |--------------------------------------------------------------------------
    */

    const handleMatiereChange = (e) => {
        const matiereId = e.target.value;

        setData((currentData) => ({
            ...currentData,
            matiere_id: matiereId,
            enseignant_id: estSuperAdmin ? "" : currentData.enseignant_id,
        }));
    };

    return (
        <AdminLayout>
            <Head title="Nouvelle évaluation" />

            <form onSubmit={submit} className="space-y-6">
                {/* ==========================================================
                    EN-TÊTE
                ========================================================== */}

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Nouvelle évaluation
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Création d'une nouvelle évaluation scolaire
                    </p>
                </div>

                {/* ==========================================================
                    AFFECTATION PÉDAGOGIQUE
                ========================================================== */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Affectation pédagogique
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Sélectionnez la classe et la matière concernées.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* ==================================================
                            ÉTABLISSEMENT
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Établissement
                            </label>

                            {estSuperAdmin ? (
                                <select
                                    value={data.etablissement_id}
                                    onChange={handleEtablissementChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                                >
                                    <option value="">
                                        Sélectionner un établissement
                                    </option>

                                    {etablissements.map((etablissement) => (
                                        <option
                                            key={etablissement.id}
                                            value={etablissement.id}
                                        >
                                            {etablissement.nom}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={etablissementProfesseur?.nom ?? ""}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"
                                />
                            )}

                            {errors.etablissement_id && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.etablissement_id}
                                </p>
                            )}
                        </div>

                        {/* ==================================================
                            ANNÉE SCOLAIRE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Année scolaire
                            </label>

                            {estSuperAdmin ? (
                                <select
                                    value={data.annee_scolaire_id}
                                    onChange={handleAnneeChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                                >
                                    <option value="">
                                        Sélectionner une année scolaire
                                    </option>

                                    {annees.map((annee) => (
                                        <option key={annee.id} value={annee.id}>
                                            {annee.libelle}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={
                                        anneeSelectionnee?.libelle ??
                                        anneeParDefaut?.libelle ??
                                        ""
                                    }
                                    readOnly
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-700"
                                />
                            )}

                            {errors.annee_scolaire_id && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.annee_scolaire_id}
                                </p>
                            )}
                        </div>

                        {/* ==================================================
                            CLASSE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Classe
                            </label>

                            <select
                                value={data.classe_id}
                                onChange={handleClasseChange}
                                disabled={
                                    !data.etablissement_id ||
                                    !data.annee_scolaire_id
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 disabled:bg-gray-50"
                            >
                                <option value="">
                                    Sélectionner une classe
                                </option>

                                {classesAutorisees.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.libelle}
                                    </option>
                                ))}
                            </select>

                            {errors.classe_id && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.classe_id}
                                </p>
                            )}

                            {data.etablissement_id &&
                                data.annee_scolaire_id &&
                                classesAutorisees.length === 0 && (
                                    <p className="mt-1 text-sm text-orange-600">
                                        Aucune classe disponible pour cette
                                        sélection.
                                    </p>
                                )}
                        </div>

                        {/* ==================================================
                            MATIÈRE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Matière
                            </label>

                            <select
                                value={data.matiere_id}
                                onChange={handleMatiereChange}
                                disabled={!data.classe_id}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 disabled:bg-gray-50"
                            >
                                <option value="">
                                    Sélectionner une matière
                                </option>

                                {matieresAutorisees.map((matiere) => (
                                    <option key={matiere.id} value={matiere.id}>
                                        {matiere.libelle}
                                    </option>
                                ))}
                            </select>

                            {errors.matiere_id && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.matiere_id}
                                </p>
                            )}

                            {data.classe_id &&
                                matieresAutorisees.length === 0 && (
                                    <p className="mt-1 text-sm text-orange-600">
                                        Aucune matière affectée à cette classe.
                                    </p>
                                )}
                        </div>

                        {/* ==================================================
                            ENSEIGNANT
                        ================================================== */}

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Enseignant
                            </label>

                            {estSuperAdmin ? (
                                <select
                                    value={data.enseignant_id}
                                    onChange={(e) =>
                                        setData("enseignant_id", e.target.value)
                                    }
                                    disabled={!data.etablissement_id}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 disabled:bg-gray-50"
                                >
                                    <option value="">
                                        Sélectionner un enseignant
                                    </option>

                                    {enseignantsAutorises.map((enseignant) => (
                                        <option
                                            key={enseignant.id}
                                            value={enseignant.id}
                                        >
                                            {enseignant.nom}{" "}
                                            {enseignant.prenoms}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={
                                        enseignantProfesseur
                                            ? `${enseignantProfesseur.nom} ${enseignantProfesseur.prenoms}`
                                            : ""
                                    }
                                    readOnly
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"
                                />
                            )}

                            {errors.enseignant_id && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.enseignant_id}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ==========================================================
                    INFORMATIONS SUR L'ÉVALUATION
                ========================================================== */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Informations sur l'évaluation
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Renseignez les caractéristiques de l'évaluation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* ==================================================
                            LIBELLÉ
                        ================================================== */}

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Libellé
                            </label>

                            <input
                                type="text"
                                value={data.libelle}
                                onChange={(e) =>
                                    setData("libelle", e.target.value)
                                }
                                placeholder="Ex. Devoir d'anglais n°1"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                            />

                            {errors.libelle && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.libelle}
                                </p>
                            )}
                        </div>

                        {/* ==================================================
                            TYPE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Type
                            </label>

                            <select
                                value={data.type}
                                onChange={(e) =>
                                    setData("type", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                            >
                                <option value="Devoir">Devoir</option>

                                <option value="Interrogation">
                                    Interrogation
                                </option>

                                <option value="Composition">Composition</option>

                                <option value="Examen">Examen</option>
                            </select>

                            {errors.type && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.type}
                                </p>
                            )}
                        </div>

                        {/* ==================================================
                            NUMÉRO
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Numéro
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={data.numero}
                                onChange={(e) =>
                                    setData("numero", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                            />

                            {errors.numero && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.numero}
                                </p>
                            )}
                        </div>

                        {/* ==================================================
                            DATE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Date
                            </label>

                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) =>
                                    setData("date", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                            />

                            {errors.date && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.date}
                                </p>
                            )}
                        </div>

                        {/* ==================================================
                            BARÈME
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Barème
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={data.bareme}
                                onChange={(e) =>
                                    setData("bareme", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                            />

                            {errors.bareme && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.bareme}
                                </p>
                            )}
                        </div>

                        {/* ==================================================
                            COEFFICIENT
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Coefficient
                            </label>

                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={data.coefficient}
                                onChange={(e) =>
                                    setData("coefficient", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                            />

                            {errors.coefficient && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.coefficient}
                                </p>
                            )}
                        </div>

                        {/* ==================================================
                            PÉRIODE
                        ================================================== */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Période
                            </label>

                            <select
                                value={data.periode}
                                onChange={(e) =>
                                    setData("periode", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                            >
                                <option value="">
                                    Sélectionner une période
                                </option>

                                <option value="Trimestre 1">Trimestre 1</option>

                                <option value="Trimestre 2">Trimestre 2</option>

                                <option value="Trimestre 3">Trimestre 3</option>
                            </select>

                            {errors.periode && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.periode}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ==========================================================
                    BOUTONS
                ========================================================== */}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? "Création..." : "Créer l'évaluation"}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
