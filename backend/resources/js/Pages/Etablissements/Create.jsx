import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create() {

    const { data, setData, post, processing, errors } = useForm({
        nom: "",
        code: "",
        ville: "",
        adresse: "",
        telephone: "",
        email: "",
    });

    function submit(e) {
        e.preventDefault();
        post(route("etablissements.store"));
    }

    return (
        <AdminLayout>

            <Head title="Nouvel établissement" />

            <div className="max-w-4xl mx-auto">

                <div className="bg-white rounded-xl shadow p-8">

                    <h1 className="text-3xl font-bold mb-8">
                        Nouvel établissement
                    </h1>

                    <form onSubmit={submit} className="space-y-6">

                        <div>
                            <label className="block font-semibold mb-2">
                                Nom *
                            </label>

                            <input
                                type="text"
                                value={data.nom}
                                onChange={(e) => setData("nom", e.target.value)}
                                className="w-full border rounded-lg p-3"
                            />

                            {errors.nom && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.nom}
                                </p>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>
                                <label className="block font-semibold mb-2">
                                    Code
                                </label>

                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData("code", e.target.value)}
                                    className="w-full border rounded-lg p-3"
                                />

                                {errors.code && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">
                                    Ville *
                                </label>

                                <input
                                    type="text"
                                    value={data.ville}
                                    onChange={(e) => setData("ville", e.target.value)}
                                    className="w-full border rounded-lg p-3"
                                />

                                {errors.ville && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.ville}
                                    </p>
                                )}
                            </div>

                        </div>

                        <div>
                            <label className="block font-semibold mb-2">
                                Adresse
                            </label>

                            <input
                                type="text"
                                value={data.adresse}
                                onChange={(e) => setData("adresse", e.target.value)}
                                className="w-full border rounded-lg p-3"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>
                                <label className="block font-semibold mb-2">
                                    Téléphone
                                </label>

                                <input
                                    type="text"
                                    value={data.telephone}
                                    onChange={(e) => setData("telephone", e.target.value)}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    className="w-full border rounded-lg p-3"
                                />

                                {errors.email && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                        </div>

                        <div className="flex justify-end gap-4 pt-6">

                            <Link
                                href={route("etablissements.index")}
                                className="px-6 py-3 rounded-lg border"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Enregistrer
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </AdminLayout>
    );
}