import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({
    evaluation,
    etablissements = [],
    annees = [],
    classes = [],
    matieres = [],
    enseignants = [],
    affectations = [],
}) {
    const { data, setData, put, processing, errors } = useForm({
        etablissement_id: evaluation.etablissement_id ?? "",
        annee_scolaire_id: evaluation.annee_scolaire_id ?? "",
        classe_id: evaluation.classe_id ?? "",
        matiere_id: evaluation.matiere_id ?? "",
        enseignant_id: evaluation.enseignant_id ?? "",

        libelle: evaluation.libelle ?? "",
        type: evaluation.type ?? "Interrogation",
        numero: evaluation.numero ?? "",
        date_evaluation: evaluation.date_evaluation ?? "",
        bareme: String(evaluation.bareme ?? "20"),
        coefficient: String(evaluation.coefficient ?? "1"),
        periode: evaluation.periode ?? "Trimestre 1",
        active: Boolean(evaluation.active),
    });

    /*
    |--------------------------------------------------------------------------
    | Affectations actives
    |--------------------------------------------------------------------------
    | Le contrôleur Laravel envoie déjà uniquement les affectations actives.
    */

    const affectationsActives = affectations;

    /*
    |--------------------------------------------------------------------------
    | Classes disponibles
    |--------------------------------------------------------------------------
    | Toutes les classes appartenant à l'établissement sélectionné.
    */

    const classesDisponibles = classes.filter((classe) => {
        if (!data.etablissement_id) {
            return false;
        }

        return (
            String(classe.etablissement_id) ===
            String(data.etablissement_id)
        );
    });

    /*
    |--------------------------------------------------------------------------
    | Matières disponibles
    |--------------------------------------------------------------------------
    | Une matière doit posséder une affectation correspondant à :
    | établissement + année + classe.
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
                String(affectation.classe_id) ===
                    String(data.classe_id) &&
                String(affectation.matiere_id) ===
                    String(matiere.id),
        );
    });

    /*
    |--------------------------------------------------------------------------
    | Enseignants disponibles
    |--------------------------------------------------------------------------
    | L'enseignant doit posséder exactement l'affectation correspondant
    | à l'établissement, l'année, la classe et la matière.
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
                String(affectation.classe_id) ===
                    String(data.classe_id) &&
                String(affectation.matiere_id) ===
                    String(data.matiere_id) &&
                String(affectation.enseignant_id) ===
                    String(enseignant.id),
        );
    });

    /*
    |--------------------------------------------------------------------------
    | Affectation sélectionnée
    |--------------------------------------------------------------------------
    */

    const affectationSelectionnee = affectationsActives.find(
        (affectation) =>
            String(affectation.etablissement_id) ===
                String(data.etablissement_id) &&
            String(affectation.annee_scolaire_id) ===
                String(data.annee_scolaire_id) &&
            String(affectation.classe_id) ===
                String(data.classe_id) &&
            String(affectation.matiere_id) ===
                String(data.matiere_id) &&
            String(affectation.enseignant_id) ===
                String(data.enseignant_id),
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
            coefficient: "1",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Changement d'année
    |--------------------------------------------------------------------------
    */

    function handleAnneeChange(value) {
        setData({
            ...data,
            annee_scolaire_id: value,
            classe_id: "",
            matiere_id: "",
            enseignant_id: "",
            coefficient: "1",
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
            coefficient: "1",
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
            coefficient: "1",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Changement d'enseignant
    |--------------------------------------------------------------------------
    | Le coefficient est récupéré depuis l'affectation.
    */

    function handleEnseignantChange(value) {
        const affectation = affectationsActives.find(
            (item) =>
                String(item.etablissement_id) ===
                    String(data.etablissement_id) &&
                String(item.annee_scolaire_id) ===
                    String(data.annee_scolaire_id) &&
                String(item.classe_id) ===
                    String(data.classe_id) &&
                String(item.matiere_id) ===
                    String(data.matiere_id) &&
                String(item.enseignant_id) === String(value),
        );

        setData({
            ...data,
            enseignant_id: value,
            coefficient: String(affectation?.coefficient ?? 1),
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Soumission
    |--------------------------------------------------------------------------
    */

    function submit(e) {
        e.preventDefault();

        if (!affectationValide) {
            alert(
                "Impossible de modifier cette évaluation : aucun enseignant actif ne possède une affectation correspondant à l'établissement, l'année, la classe et la matière sélectionnés.",
            );

            return;
        }

        put(route("evaluations.update", evaluation.id));
    }

    return (
        <AdminLayout>
            <Head title={`Modifier - ${evaluation.libelle}`} />

            <div className="mx-auto max-w-6xl">
                <div className="rounded-xl bg-white p-8 shadow">

                    {/* EN-TÊTE */}

                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Modifier l'évaluation
                            </h1>

                            <p className="mt-2 text-gray-500">
                                Modifier les informations de l'évaluation
                            </p>
                        </div>

                        <Link
                            href={route("evaluations.index")}
                            className="rounded-lg border px-5 py-3 hover:bg-gray-50"
                        >
                            ← Retour
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-8">

                        {/* SCOLARITÉ */}

                        <div className="rounded-xl border bg-white shadow-sm">
                            <div className="border-b bg-slate-50 px-6 py-4">
                                <h2 className="text-xl font-bold">
                                    🎓 Scolarité
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                                {/* ÉTABLISSEMENT */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Établissement
                                    </label>

                                    <select
                                        required
                                        value={data.etablissement_id}
                                        onChange={(e) =>
                                            handleEtablissementChange(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {etablissements.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nom}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.etablissement_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.etablissement_id}
                                        </p>
                                    )}
                                </div>

                                {/* ANNÉE */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Année scolaire
                                    </label>

                                    <select
                                        required
                                        disabled={!data.etablissement_id}
                                        value={data.annee_scolaire_id}
                                        onChange={(e) =>
                                            handleAnneeChange(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {annees.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.libelle ??
                                                    `${item.date_debut} - ${item.date_fin}`}
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
                                    <label className="mb-2 block font-semibold">
                                        Classe
                                    </label>

                                    <select
                                        required
                                        disabled={!data.etablissement_id}
                                        value={data.classe_id}
                                        onChange={(e) =>
                                            handleClasseChange(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {classesDisponibles.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.libelle}
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
                                    <label className="mb-2 block font-semibold">
                                        Matière
                                    </label>

                                    <select
                                        required
                                        disabled={
                                            !data.etablissement_id ||
                                            !data.annee_scolaire_id ||
                                            !data.classe_id
                                        }
                                        value={data.matiere_id}
                                        onChange={(e) =>
                                            handleMatiereChange(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {matieresDisponibles.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.libelle}
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

                                <div className="md:col-span-2">
                                    <label className="mb-2 block font-semibold">
                                        Enseignant
                                    </label>

                                    <select
                                        required
                                        disabled={!data.matiere_id}
                                        value={data.enseignant_id}
                                        onChange={(e) =>
                                            handleEnseignantChange(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {!data.matiere_id
                                                ? "Sélectionner d'abord une matière"
                                                : enseignantsDisponibles.length === 0
                                                  ? "Aucun enseignant affecté"
                                                  : "Sélectionner un enseignant"}
                                        </option>

                                        {enseignantsDisponibles.map(
                                            (item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.nom} {item.prenoms}
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    {data.matiere_id &&
                                        enseignantsDisponibles.length === 0 && (
                                            <p className="mt-2 text-sm text-amber-600">
                                                Aucun enseignant actif n'est
                                                affecté à cette matière dans
                                                cette classe pour l'année
                                                sélectionnée.
                                            </p>
                                        )}

                                    {errors.enseignant_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.enseignant_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* VÉRIFICATION */}

                        {data.enseignant_id && (
                            <div
                                className={`rounded-lg border p-4 ${
                                    affectationValide
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                {affectationValide ? (
                                    <p>
                                        ✓ Affectation vérifiée : cet enseignant
                                        est bien affecté à cette matière dans
                                        la classe et pour l'année sélectionnées.
                                    </p>
                                ) : (
                                    <p>
                                        ✕ Affectation invalide : cette
                                        combinaison n'est pas autorisée.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* INFORMATIONS ÉVALUATION */}

                        <div className="rounded-xl border bg-white shadow-sm">
                            <div className="border-b bg-slate-50 px-6 py-4">
                                <h2 className="text-xl font-bold">
                                    📝 Informations sur l'évaluation
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                                <div className="md:col-span-2">
                                    <label className="mb-2 block font-semibold">
                                        Libellé de l'évaluation
                                    </label>

                                    <input
                                        required
                                        type="text"
                                        value={data.libelle}
                                        onChange={(e) =>
                                            setData(
                                                "libelle",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    />

                                    {errors.libelle && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.libelle}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Type d'évaluation
                                    </label>

                                    <select
                                        required
                                        value={data.type}
                                        onChange={(e) =>
                                            setData(
                                                "type",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="Interrogation">
                                            Interrogation
                                        </option>
                                        <option value="Devoir">
                                            Devoir
                                        </option>
                                        <option value="Composition">
                                            Composition
                                        </option>
                                        <option value="Examen">
                                            Examen
                                        </option>
                                        <option value="Autre">
                                            Autre
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Numéro
                                    </label>

                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={data.numero}
                                        onChange={(e) =>
                                            setData(
                                                "numero",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    />

                                    {errors.numero && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.numero}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Date de l'évaluation
                                    </label>

                                    <input
                                        required
                                        type="date"
                                        value={data.date_evaluation}
                                        onChange={(e) =>
                                            setData(
                                                "date_evaluation",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    />

                                    {errors.date_evaluation && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.date_evaluation}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Période
                                    </label>

                                    <select
                                        required
                                        value={data.periode}
                                        onChange={(e) =>
                                            setData(
                                                "periode",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="Trimestre 1">
                                            Trimestre 1
                                        </option>
                                        <option value="Trimestre 2">
                                            Trimestre 2
                                        </option>
                                        <option value="Trimestre 3">
                                            Trimestre 3
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Barème
                                    </label>

                                    <select
                                        required
                                        value={data.bareme}
                                        onChange={(e) =>
                                            setData(
                                                "bareme",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                                            (value) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {value} points
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

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Coefficient
                                    </label>

                                    <input
                                        type="number"
                                        value={data.coefficient}
                                        readOnly
                                        className="w-full cursor-not-allowed rounded-lg border bg-gray-100 p-3 text-gray-700"
                                    />

                                    <p className="mt-1 text-xs text-gray-500">
                                        Coefficient récupéré automatiquement
                                        depuis l'affectation de l'enseignant.
                                    </p>

                                    {errors.coefficient && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.coefficient}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* STATUT */}

                        <div className="rounded-xl border bg-white shadow-sm">
                            <div className="border-b bg-slate-50 px-6 py-4">
                                <h2 className="text-xl font-bold">
                                    ⚙️ Statut
                                </h2>
                            </div>

                            <div className="p-6">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.active}
                                        onChange={(e) =>
                                            setData(
                                                "active",
                                                e.target.checked,
                                            )
                                        }
                                        className="h-5 w-5"
                                    />

                                    <span className="font-semibold">
                                        Évaluation active
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* BOUTONS */}

                        <div className="flex justify-end gap-4">
                            <Link
                                href={route("evaluations.index")}
                                className="rounded-lg border px-6 py-3 hover:bg-gray-50"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    processing || !affectationValide
                                }
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? "Modification..."
                                    : "💾 Enregistrer les modifications"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}