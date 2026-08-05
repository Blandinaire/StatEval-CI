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
                    className="w-full rounded-lg border p-3"
                    placeholder="Sixième"
                />

                {errors.libelle && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.libelle}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">

                <div>
                    <label className="block font-semibold mb-2">
                        Code
                    </label>

                    <input
                        type="text"
                        value={data.code}
                        onChange={(e) => setData("code", e.target.value)}
                        className="w-full rounded-lg border p-3"
                        placeholder="6e"
                    />

                    {errors.code && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.code}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block font-semibold mb-2">
                        Ordre
                    </label>

                    <input
                        type="number"
                        value={data.ordre}
                        onChange={(e) => setData("ordre", e.target.value)}
                        className="w-full rounded-lg border p-3"
                    />

                    {errors.ordre && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.ordre}
                        </p>
                    )}
                </div>

            </div>

            <div className="flex justify-end gap-4">

                <Link
                    href={route("niveaux.index")}
                    className="rounded-lg border px-6 py-3"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                    {submitLabel}
                </button>

            </div>

        </form>
    );
}