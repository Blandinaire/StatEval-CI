import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({
    etablissements = [],
    annees = [],
    classes = [],
    matieres = [],
    enseignants = [],
    affectations = [],
}) {
    const { data, setData, post, processing, errors } = useForm({
        etablissement_id: "",
        annee_scolaire_id: "",
        classe_id: "",
        matiere_id: "",
        enseignant_id: "",
        libelle: "",
        type: "Interrogation",
        numero: "",
        date_evaluation: "",
        bareme: 20,
        coefficient: 1,
        periode: "Trimestre 1",
        active: true,
    });

    /*
    |--------------------------------------------------------------------------
    | Affectations actives
    |--------------------------------------------------------------------------
    */

    const affectationsActives = affectations;

    console.log("ÉTABLISSEMENT SÉLECTIONNÉ :", data.etablissement_id);
    console.log("ANNÉE SÉLECTIONNÉE :", data.annee_scolaire_id);

    console.log("CLASSES REÇUES :", classes);

    console.log(
        "AFFECTATIONS REÇUES :",
        affectations.map((affectation) => ({
            id: affectation.id,
            etablissement_id: affectation.etablissement_id,
            annee_scolaire_id: affectation.annee_scolaire_id,
            classe_id: affectation.classe_id,
            matiere_id: affectation.matiere_id,
            enseignant_id: affectation.enseignant_id,
            coefficient: affectation.coefficient,
            actif: affectation.actif,
            type_actif: typeof affectation.actif,
        })),
    );

    console.log(
        "VALEURS DU CHAMP ACTIF :",
        affectations.map((affectation) => affectation.actif),
    );

    console.log("AFFECTATIONS ACTIVES :", affectationsActives);

    /*
    |--------------------------------------------------------------------------
    | Classes disponibles
    |--------------------------------------------------------------------------
    | Une classe doit correspondre à l'établissement et à l'année sélectionnés.
    */

    /*
|--------------------------------------------------------------------------
| Classes disponibles
|--------------------------------------------------------------------------
| Toutes les classes appartenant à l'établissement sélectionné sont affichées.
| L'année scolaire est gérée ensuite par les affectations des enseignants.
*/

    const classesDisponibles = classes.filter((classe) => {
        if (!data.etablissement_id) {
            return false;
        }

        return (
            String(classe.etablissement_id) === String(data.etablissement_id)
        );
    });

    console.log("CLASSES DISPONIBLES :", classesDisponibles);

    /*
    |--------------------------------------------------------------------------
    | Matières disponibles
    |--------------------------------------------------------------------------
    | Une matière doit être réellement affectée à la classe sélectionnée.
    */

    const matieresDisponibles = matieres.filter((matiere) => {
        if (
            !data.etablissement_id ||
            !data.annee_scolaire_id ||
            !data.classe_id
        ) {
            return false;
        }

        return affectationsActives.some(
            (affectation) =>
                String(affectation.etablissement_id) ===
                    String(data.etablissement_id) &&
                String(affectation.annee_scolaire_id) ===
                    String(data.annee_scolaire_id) &&
                String(affectation.classe_id) === String(data.classe_id) &&
                String(affectation.matiere_id) === String(matiere.id),
        );
    });

    /*
    |--------------------------------------------------------------------------
    | Enseignants disponibles
    |--------------------------------------------------------------------------
    | Sécurité principale :
    | l'enseignant doit posséder une affectation active correspondant
    | exactement à :
    |
    | établissement
    | année scolaire
    | classe
    | matière
    |--------------------------------------------------------------------------
    */

    const enseignantsDisponibles = enseignants.filter((enseignant) => {
        if (
            !data.etablissement_id ||
            !data.annee_scolaire_id ||
            !data.classe_id ||
            !data.matiere_id
        ) {
            return false;
        }

        return affectationsActives.some(
            (affectation) =>
                String(affectation.etablissement_id) ===
                    String(data.etablissement_id) &&
                String(affectation.annee_scolaire_id) ===
                    String(data.annee_scolaire_id) &&
                String(affectation.classe_id) === String(data.classe_id) &&
                String(affectation.matiere_id) === String(data.matiere_id) &&
                String(affectation.enseignant_id) === String(enseignant.id),
        );
    });

    /*
    |--------------------------------------------------------------------------
    | Affectation sélectionnée
    |--------------------------------------------------------------------------
    | Elle permet de vérifier définitivement que le professeur choisi
    | correspond bien à la combinaison sélectionnée.
    */

    const affectationSelectionnee = affectationsActives.find(
        (affectation) =>
            String(affectation.etablissement_id) ===
                String(data.etablissement_id) &&
            String(affectation.annee_scolaire_id) ===
                String(data.annee_scolaire_id) &&
            String(affectation.classe_id) === String(data.classe_id) &&
            String(affectation.matiere_id) === String(data.matiere_id) &&
            String(affectation.enseignant_id) === String(data.enseignant_id),
    );

    const affectationValide = Boolean(affectationSelectionnee);

    /*
    |--------------------------------------------------------------------------
    | Changement d'établissement
    |--------------------------------------------------------------------------
    */

    function handleEtablissementChange(value) {
        setData({
            ...data,
            etablissement_id: value,
            annee_scolaire_id: "",
            classe_id: "",
            matiere_id: "",
            enseignant_id: "",
            coefficient: 1,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Changement d'année scolaire
    |--------------------------------------------------------------------------
    */

    function handleAnneeChange(value) {
        setData({
            ...data,
            annee_scolaire_id: value,
            classe_id: "",
            matiere_id: "",
            enseignant_id: "",
            coefficient: 1,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Changement de classe
    |--------------------------------------------------------------------------
    */

    function handleClasseChange(value) {
        setData({
            ...data,
            classe_id: value,
            matiere_id: "",
            enseignant_id: "",
            coefficient: 1,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Changement de matière
    |--------------------------------------------------------------------------
    */

    function handleMatiereChange(value) {
        setData({
            ...data,
            matiere_id: value,
            enseignant_id: "",
            coefficient: 1,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Changement d'enseignant
    |--------------------------------------------------------------------------
    | Le coefficient de l'affectation est automatiquement récupéré.
    */

    function handleEnseignantChange(value) {
        const affectation = affectationsActives.find(
            (item) =>
                String(item.etablissement_id) ===
                    String(data.etablissement_id) &&
                String(item.annee_scolaire_id) ===
                    String(data.annee_scolaire_id) &&
                String(item.classe_id) === String(data.classe_id) &&
                String(item.matiere_id) === String(data.matiere_id) &&
                String(item.enseignant_id) === String(value),
        );

        setData({
            ...data,
            enseignant_id: value,
            coefficient: affectation?.coefficient ?? 1,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Enregistrement
    |--------------------------------------------------------------------------
    */

    function handleSubmit(e) {
        e.preventDefault();

        /*
        |--------------------------------------------------------------
        | Blocage supplémentaire côté React
        |--------------------------------------------------------------
        */

        if (!affectationValide) {
            alert(
                "Impossible d'enregistrer cette évaluation : aucun enseignant n'est affecté à cette matière dans la classe et pour l'année scolaire sélectionnées.",
            );

            return;
        }

        post(route("evaluations.store"));
    }

    return (
        <AdminLayout>
            <Head title="Nouvelle évaluation" />

            <div className="space-y-6">
                {/* En-tête */}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Nouvelle évaluation
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Créer une nouvelle évaluation scolaire
                        </p>
                    </div>

                    <Link
                        href={route("evaluations.index")}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                        Retour à la liste
                    </Link>
                </div>

                {/* Formulaire */}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* ÉTABLISSEMENT */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Établissement
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <select
                                required
                                value={data.etablissement_id}
                                onChange={(e) =>
                                    handleEtablissementChange(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
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

                            {errors.etablissement_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.etablissement_id}
                                </p>
                            )}
                        </div>

                        {/* ANNÉE SCOLAIRE */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Année scolaire
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <select
                                required
                                disabled={!data.etablissement_id}
                                value={data.annee_scolaire_id}
                                onChange={(e) =>
                                    handleAnneeChange(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">Sélectionner une année</option>

                                {annees.map((annee) => (
                                    <option key={annee.id} value={annee.id}>
                                        {annee.libelle ??
                                            `${annee.date_debut} - ${annee.date_fin}`}
                                    </option>
                                ))}
                            </select>

                            {errors.annee_scolaire_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.annee_scolaire_id}
                                </p>
                            )}
                        </div>

                        {/* CLASSE */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Classe
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <select
                                required
                                disabled={
                                    !data.etablissement_id ||
                                    !data.annee_scolaire_id
                                }
                                value={data.classe_id}
                                onChange={(e) =>
                                    handleClasseChange(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">
                                    Sélectionner une classe
                                </option>

                                {classesDisponibles.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.libelle}
                                    </option>
                                ))}
                            </select>

                            {errors.classe_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.classe_id}
                                </p>
                            )}
                        </div>

                        {/* MATIÈRE */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Matière
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <select
                                required
                                disabled={!data.classe_id}
                                value={data.matiere_id}
                                onChange={(e) =>
                                    handleMatiereChange(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">
                                    Sélectionner une matière
                                </option>

                                {matieresDisponibles.map((matiere) => (
                                    <option key={matiere.id} value={matiere.id}>
                                        {matiere.libelle}
                                    </option>
                                ))}
                            </select>

                            {errors.matiere_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.matiere_id}
                                </p>
                            )}
                        </div>

                        {/* ENSEIGNANT */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Enseignant
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <select
                                required
                                disabled={!data.matiere_id}
                                value={data.enseignant_id}
                                onChange={(e) =>
                                    handleEnseignantChange(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">
                                    {!data.matiere_id
                                        ? "Sélectionner d'abord une matière"
                                        : enseignantsDisponibles.length === 0
                                          ? "Aucun enseignant affecté"
                                          : "Sélectionner un enseignant"}
                                </option>

                                {enseignantsDisponibles.map((enseignant) => (
                                    <option
                                        key={enseignant.id}
                                        value={enseignant.id}
                                    >
                                        {enseignant.nom} {enseignant.prenoms}
                                    </option>
                                ))}
                            </select>

                            {data.matiere_id &&
                                enseignantsDisponibles.length === 0 && (
                                    <p className="mt-1 text-sm text-amber-600">
                                        Aucun enseignant actif n'est affecté à
                                        cette matière dans cette classe.
                                    </p>
                                )}

                            {errors.enseignant_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.enseignant_id}
                                </p>
                            )}
                        </div>

                        {/* TYPE */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Type d'évaluation
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <select
                                required
                                value={data.type}
                                onChange={(e) =>
                                    setData("type", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="Interrogation">
                                    Interrogation
                                </option>

                                <option value="Devoir">Devoir</option>

                                <option value="Composition">Composition</option>

                                <option value="Examen">Examen</option>

                                <option value="Autre">Autre</option>
                            </select>
                        </div>

                        {/* LIBELLÉ */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Libellé
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <input
                                required
                                type="text"
                                value={data.libelle}
                                onChange={(e) =>
                                    setData("libelle", e.target.value)
                                }
                                placeholder="Exemple : Devoir de mathématiques"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                            />

                            {errors.libelle && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.libelle}
                                </p>
                            )}
                        </div>

                        {/* NUMÉRO */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Numéro
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <input
                                required
                                type="number"
                                min="1"
                                value={data.numero}
                                onChange={(e) =>
                                    setData("numero", e.target.value)
                                }
                                placeholder="Exemple : 1"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                            />

                            {errors.numero && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.numero}
                                </p>
                            )}
                        </div>

                        {/* DATE */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Date de l'évaluation
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <input
                                required
                                type="date"
                                value={data.date_evaluation}
                                onChange={(e) =>
                                    setData("date_evaluation", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                            />

                            {errors.date_evaluation && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.date_evaluation}
                                </p>
                            )}
                        </div>

                        {/* BARÈME */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Barème
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <select
                                required
                                value={data.bareme}
                                onChange={(e) =>
                                    setData("bareme", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                            >
                                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                                    (bareme) => (
                                        <option key={bareme} value={bareme}>
                                            {bareme} points
                                        </option>
                                    ),
                                )}
                            </select>

                            {errors.bareme && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.bareme}
                                </p>
                            )}
                        </div>

                        {/* COEFFICIENT */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Coefficient
                            </label>

                            <input
                                type="number"
                                value={data.coefficient}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-gray-700 focus:outline-none"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Coefficient récupéré automatiquement depuis
                                l'affectation de l'enseignant.
                            </p>

                            {errors.coefficient && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.coefficient}
                                </p>
                            )}
                        </div>

                        {/* PÉRIODE */}

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Période
                                <span className="ml-1 text-red-600">*</span>
                            </label>

                            <select
                                required
                                value={data.periode}
                                onChange={(e) =>
                                    setData("periode", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="Trimestre 1">Trimestre 1</option>

                                <option value="Trimestre 2">Trimestre 2</option>

                                <option value="Trimestre 3">Trimestre 3</option>
                            </select>

                            {errors.periode && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.periode}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Vérification de l'affectation */}

                    {data.enseignant_id && (
                        <div
                            className={`mt-6 rounded-lg border p-4 ${
                                affectationValide
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                            }`}
                        >
                            {affectationValide ? (
                                <p>
                                    ✓ Affectation vérifiée : cet enseignant est
                                    bien affecté à cette matière dans la classe
                                    sélectionnée.
                                </p>
                            ) : (
                                <p>
                                    ✕ Affectation invalide : cette combinaison
                                    établissement, année, classe, matière et
                                    enseignant n'est pas autorisée.
                                </p>
                            )}
                        </div>
                    )}

                    {/* STATUT */}

                    <div className="mt-6">
                        <label className="flex items-center gap-3 text-gray-700">
                            <input
                                type="checkbox"
                                checked={data.active}
                                onChange={(e) =>
                                    setData("active", e.target.checked)
                                }
                                className="h-4 w-4"
                            />

                            <span className="font-medium">
                                Évaluation active
                            </span>
                        </label>
                    </div>

                    {/* BOUTONS */}

                    <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                        <Link
                            href={route("evaluations.index")}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={processing || !affectationValide}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? "Enregistrement..."
                                : "Enregistrer l'évaluation"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
