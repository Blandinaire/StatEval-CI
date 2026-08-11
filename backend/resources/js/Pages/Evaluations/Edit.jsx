import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({
    evaluation,
    etablissements,
    annees,
    classes,
    matieres,
    enseignants,
}) {
    const { data, setData, put, processing, errors } = useForm({
        etablissement_id: evaluation.etablissement_id ?? "",
        annee_scolaire_id: evaluation.annee_scolaire_id ?? "",
        classe_id: evaluation.classe_id ?? "",
        matiere_id: evaluation.matiere_id ?? "",
        enseignant_id: evaluation.enseignant_id ?? "",

        libelle: evaluation.libelle ?? "",
        type: evaluation.type ?? "",
        numero: evaluation.numero ?? "",
        date_evaluation: evaluation.date_evaluation ?? "",
        bareme: String(evaluation.bareme ?? "20"),
        coefficient: String(evaluation.coefficient ?? "1"),
        periode: evaluation.periode ?? "",
        active: Boolean(evaluation.active),
    });

    function submit(e) {
        e.preventDefault();

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

                        {/* =================================================
                            SCOLARITÉ
                        ================================================= */}

                        <div className="rounded-xl border bg-white shadow-sm">

                            <div className="border-b bg-slate-50 px-6 py-4">
                                <h2 className="text-xl font-bold">
                                    🎓 Scolarité
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6">

                                {/* Établissement */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Établissement
                                    </label>

                                    <select
                                        value={data.etablissement_id}
                                        onChange={(e) =>
                                            setData(
                                                "etablissement_id",
                                                e.target.value
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

                                {/* Année scolaire */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Année scolaire
                                    </label>

                                    <select
                                        value={data.annee_scolaire_id}
                                        onChange={(e) =>
                                            setData(
                                                "annee_scolaire_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {annees.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.libelle}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.annee_scolaire_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.annee_scolaire_id}
                                        </p>
                                    )}
                                </div>

                                {/* Classe */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Classe
                                    </label>

                                    <select
                                        value={data.classe_id}
                                        onChange={(e) =>
                                            setData(
                                                "classe_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {classes.map((item) => (
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

                                {/* Matière */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Matière
                                    </label>

                                    <select
                                        value={data.matiere_id}
                                        onChange={(e) =>
                                            setData(
                                                "matiere_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {matieres.map((item) => (
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

                                {/* Enseignant */}

                                <div className="col-span-2">
                                    <label className="mb-2 block font-semibold">
                                        Enseignant
                                    </label>

                                    <select
                                        value={data.enseignant_id}
                                        onChange={(e) =>
                                            setData(
                                                "enseignant_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {enseignants.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nom} {item.prenoms}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.enseignant_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.enseignant_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            INFORMATIONS ÉVALUATION
                        ================================================= */}

                        <div className="rounded-xl border bg-white shadow-sm">

                            <div className="border-b bg-slate-50 px-6 py-4">
                                <h2 className="text-xl font-bold">
                                    📝 Informations sur l'évaluation
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6">

                                {/* Libellé */}

                                <div className="col-span-2">
                                    <label className="mb-2 block font-semibold">
                                        Libellé de l'évaluation
                                    </label>

                                    <input
                                        type="text"
                                        value={data.libelle}
                                        onChange={(e) =>
                                            setData(
                                                "libelle",
                                                e.target.value
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

                                {/* Type */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Type d'évaluation
                                    </label>

                                    <select
                                        value={data.type}
                                        onChange={(e) =>
                                            setData(
                                                "type",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

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

                                    {errors.type && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                {/* Numéro */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Numéro
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={data.numero}
                                        onChange={(e) =>
                                            setData(
                                                "numero",
                                                e.target.value
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

                                {/* Date */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Date de l'évaluation
                                    </label>

                                    <input
                                        type="date"
                                        value={data.date_evaluation}
                                        onChange={(e) =>
                                            setData(
                                                "date_evaluation",
                                                e.target.value
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

                                {/* Période */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Période
                                    </label>

                                    <select
                                        value={data.periode}
                                        onChange={(e) =>
                                            setData(
                                                "periode",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

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

                                    {errors.periode && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.periode}
                                        </p>
                                    )}
                                </div>

                                {/* Barème */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Barème
                                    </label>

                                    <select
                                        value={data.bareme}
                                        onChange={(e) =>
                                            setData(
                                                "bareme",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {Array.from(
                                            { length: 10 },
                                            (_, i) => {
                                                const value =
                                                    (i + 1) * 10;

                                                return (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {value}
                                                    </option>
                                                );
                                            }
                                        )}
                                    </select>

                                    {errors.bareme && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.bareme}
                                        </p>
                                    )}
                                </div>

                                {/* Coefficient */}

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Coefficient
                                    </label>

                                    <select
                                        value={data.coefficient}
                                        onChange={(e) =>
                                            setData(
                                                "coefficient",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>

                                        {Array.from(
                                            { length: 10 },
                                            (_, i) => {
                                                const value =
                                                    (i + 1) * 0.5;

                                                return (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {value
                                                            .toString()
                                                            .replace(
                                                                ".",
                                                                ","
                                                            )}
                                                    </option>
                                                );
                                            }
                                        )}
                                    </select>

                                    {errors.coefficient && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.coefficient}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            STATUT
                        ================================================= */}

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
                                                e.target.checked
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

                        {/* =================================================
                            BOUTONS
                        ================================================= */}

                        <div className="flex justify-end gap-4">

                            <Link
                                href={route("evaluations.index")}
                                className="rounded-lg border px-6 py-3 hover:bg-gray-50"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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