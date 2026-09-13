import React from "react";
import { Head, useForm } from "@inertiajs/react";

export default function ChangePassword() {
    const { data, setData, put, processing, errors } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();

        put(route("password.update"));
    };

    return (
        <>
            <Head title="Changer le mot de passe" />

            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900">
                            StatEval-CI
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Gestion scolaire
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Changer votre mot de passe
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Vous devez modifier votre mot de passe initial avant
                            d'accéder à votre espace.
                        </p>

                        {Object.keys(errors).length > 0 && (
                            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                                {Object.values(errors).map((error, index) => (
                                    <p
                                        key={index}
                                        className="text-sm text-red-700"
                                    >
                                        {error}
                                    </p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-6 space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Mot de passe actuel
                                </label>

                                <input
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) =>
                                        setData(
                                            "current_password",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                                    autoComplete="current-password"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Nouveau mot de passe
                                </label>

                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Confirmer le nouveau mot de passe
                                </label>

                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                                    autoComplete="new-password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing
                                    ? "Modification..."
                                    : "Changer le mot de passe"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
