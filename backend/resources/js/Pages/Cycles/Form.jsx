import { Link, useForm } from "@inertiajs/react";

export default function Form({ cycle = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        code: cycle?.code ?? "",
        libelle: cycle?.libelle ?? "",
        ordre: cycle?.ordre ?? 1,
        actif: cycle?.actif ?? true,
    });

    function submit(e) {
        e.preventDefault();

        if (cycle) {
            put(route("cycles.update", cycle.id));
        } else {
            post(route("cycles.store"));
        }
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <label className="block mb-2 font-semibold">Code</label>

                <input
                    type="text"
                    value={data.code}
                    onChange={(e) => setData("code", e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                />

                {errors.code && (
                    <p className="text-red-600 text-sm mt-1">{errors.code}</p>
                )}
            </div>

            <div>
                <label className="block mb-2 font-semibold">Libellé</label>

                <input
                    type="text"
                    value={data.libelle}
                    onChange={(e) => setData("libelle", e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                />

                {errors.libelle && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.libelle}
                    </p>
                )}
            </div>

            <div>
                <label className="block mb-2 font-semibold">Ordre</label>

                <input
                    type="number"
                    value={data.ordre}
                    onChange={(e) => setData("ordre", e.target.value)}
                    className="w-full rounded-lg border-gray-300"
                />

                {errors.ordre && (
                    <p className="text-red-600 text-sm mt-1">{errors.ordre}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="actif"
                    type="checkbox"
                    checked={data.actif}
                    onChange={(e) => setData("actif", e.target.checked)}
                />

                <label htmlFor="actif">Cycle actif</label>
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
                <Link
                    href={route("cycles.index")}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing
                        ? "Enregistrement..."
                        : cycle
                          ? "Mettre à jour"
                          : "Créer le cycle"}
                </button>
            </div>
        </form>
    );
}
