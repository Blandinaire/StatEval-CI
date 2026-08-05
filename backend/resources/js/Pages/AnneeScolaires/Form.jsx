import { Link } from "@inertiajs/react";

export default function Form({
    data,
    setData,
    errors,
    processing,
    submit,
    submitLabel = "Enregistrer",
}) {
    return (
        <form onSubmit={submit} className="space-y-6">

            <div>
                <label className="block font-semibold mb-2">
                    Libellé
                </label>

                <input
                    type="text"
                    value={data.libelle}
                    onChange={(e) => setData("libelle", e.target.value)}
                    className="w-full border rounded-lg p-3"
                    placeholder="2026-2027"
                />

                {errors.libelle && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.libelle}
                    </p>
                )}
            </div>

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
                    />

                    {errors.date_fin && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.date_fin}
                        </p>
                    )}

                </div>

            </div>

            <div className="flex items-center gap-3">

                <input
                    type="checkbox"
                    checked={data.active}
                    onChange={(e) =>
                        setData("active", e.target.checked)
                    }
                />

                <span>
                    Définir comme année scolaire active
                </span>

            </div>

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
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                    {submitLabel}
                </button>

            </div>

        </form>
    );
}