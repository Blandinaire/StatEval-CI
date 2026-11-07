import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ parent }) {
    const { data, setData, put, processing, errors } = useForm({
        name: parent.name || "",
        telephone: parent.telephone || "",
        email: parent.email || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("parents.update", parent.id));
    };

    return (
        <AdminLayout>
            <Head title="Modifier un compte parent" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Modifier le compte parent
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Modifier les informations de connexion du parent.
                        </p>
                    </div>

                    <Link
                        href={route("parents.index")}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Retour à la liste
                    </Link>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="mb-2 block font-semibold text-gray-700">
                            Nom et prénoms *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-full rounded-lg border-gray-300"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold text-gray-700">
                            Téléphone
                        </label>
                        <input
                            type="text"
                            value={data.telephone}
                            onChange={(e) =>
                                setData("telephone", e.target.value)
                            }
                            className="w-full rounded-lg border-gray-300"
                        />
                        {errors.telephone && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.telephone}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block font-semibold text-gray-700">
                            Adresse e-mail
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="w-full rounded-lg border-gray-300"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                        Le rôle Parent et l'établissement de rattachement ne
                        peuvent pas être modifiés depuis ce formulaire.
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
                        <Link
                            href={route("parents.index")}
                            className="rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
