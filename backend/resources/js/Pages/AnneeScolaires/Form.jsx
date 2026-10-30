import { Link } from "@inertiajs/react";

function creerPeriodes(mode, periodesExistantes = []) {
    const nombre = mode === "trimestriel" ? 3 : 2;

    const libelles = mode === "trimestriel"
        ? ["1er trimestre", "2e trimestre", "3e trimestre"]
        : ["1er semestre", "2e semestre"];

    return Array.from({ length: nombre }, (_, index) => ({
        id: periodesExistantes[index]?.id ?? null,
        libelle: libelles[index],
        ordre: index + 1,
        date_debut: periodesExistantes[index]?.date_debut ?? "",
        date_fin: periodesExistantes[index]?.date_fin ?? "",
        actif: periodesExistantes[index]?.actif ?? true,
    }));
}

export default function Form({
    data,
    setData,
    errors,
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {
    function changerMode(mode) {
        setData("mode_periodes", mode);
        setData("periodes", creerPeriodes(mode, data.periodes));
    }

    function modifierPeriode(index, champ, valeur) {
        const nouvellesPeriodes = data.periodes.map((periode, i) =>
            i === index
                ? { ...periode, [champ]: valeur }
                : periode
        );

        setData("periodes", nouvellesPeriodes);
    }

    return (
        <form onSubmit={submit} className="space-y-6">

            {/* Libellé de l'année scolaire */}
            <div>
                <label className="block font-semibold mb-2">
                    Libellé de l'année scolaire
                </label>

                <input
                    type="text"
                    value={data.libelle}
                    onChange={(e) => setData("libelle", e.target.value)}
                    className="w-full border rounded-lg p-3"
                    placeholder="2026-2027"
                    required
                />

                {errors.libelle && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.libelle}
                    </p>
                )}
            </div>

            {/* Dates de l'année scolaire */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-semibold mb-2">
                        Date de début
                    </label>

                    <input
                        type="date"
                        value={data.date_debut}
                        onChange={(e) =>
                            setData("date_debut", e.target.value)
                        }
                        className="w-full border rounded-lg p-3"
                        required
                    />

                    {errors.date_debut && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.date_debut}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block font-semibold mb-2">
                        Date de fin
                    </label>

                    <input
                        type="date"
                        value={data.date_fin}
                        onChange={(e) =>
                            setData("date_fin", e.target.value)
                        }
                        className="w-full border rounded-lg p-3"
                        required
                    />

                    {errors.date_fin && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.date_fin}
                        </p>
                    )}
                </div>
            </div>

            {/* Organisation de l'année */}
            <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-4">
                    Organisation des périodes scolaires
                </h2>

                <label className="block font-semibold mb-2">
                    Mode d'organisation
                </label>

                <select
                    value={data.mode_periodes}
                    onChange={(e) => changerMode(e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                >
                    <option value="trimestriel">
                        Année organisée en 3 trimestres
                    </option>

                    <option value="semestriel">
                        Année organisée en 2 semestres
                    </option>
                </select>

                <p className="text-sm text-gray-600 mt-2">
                    Définissez les dates de chaque période en fonction
                    du calendrier scolaire de votre établissement.
                </p>

                {errors.mode_periodes && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.mode_periodes}
                    </p>
                )}

                {errors.periodes && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.periodes}
                    </p>
                )}
            </div>

            {/* Dates des périodes */}
            <div className="space-y-5">
                {data.periodes.map((periode, index) => (
                    <div
                        key={`${data.mode_periodes}-${periode.ordre}`}
                        className="border rounded-xl p-5 bg-gray-50"
                    >
                        <h3 className="font-bold text-lg mb-4">
                            {periode.libelle}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium mb-2">
                                    Date de début
                                </label>

                                <input
                                    type="date"
                                    value={periode.date_debut}
                                    min={data.date_debut || undefined}
                                    max={data.date_fin || undefined}
                                    onChange={(e) =>
                                        modifierPeriode(
                                            index,
                                            "date_debut",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border rounded-lg p-3 bg-white"
                                    required
                                />

                                {errors[`periodes.${index}.date_debut`] && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors[`periodes.${index}.date_debut`]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium mb-2">
                                    Date de fin
                                </label>

                                <input
                                    type="date"
                                    value={periode.date_fin}
                                    min={periode.date_debut || data.date_debut || undefined}
                                    max={data.date_fin || undefined}
                                    onChange={(e) =>
                                        modifierPeriode(
                                            index,
                                            "date_fin",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border rounded-lg p-3 bg-white"
                                    required
                                />

                                {errors[`periodes.${index}.date_fin`] && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors[`periodes.${index}.date_fin`]}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Année active */}
            <div className="flex items-center gap-3 border-t pt-5">
                <input
                    type="checkbox"
                    checked={data.active}
                    onChange={(e) =>
                        setData("active", e.target.checked)
                    }
                    className="w-4 h-4"
                />

                <span>
                    Définir comme année scolaire active
                </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Link
                    href={route("annee-scolaires.index")}
                    className="px-6 py-3 border rounded-lg"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing ? "Enregistrement..." : submitLabel}
                </button>
            </div>

        </form>
    );
}