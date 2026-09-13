import React, { useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";

export default function Login({ etablissements = [], status }) {
    const [mode, setMode] = useState("personnel");
    const [roles, setRoles] = useState([]);
    const [personnes, setPersonnes] = useState([]);
    const [loadingPersonnes, setLoadingPersonnes] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        mode: "personnel",
        email: "",
        etablissement_id: "",
        role: "",
        user_id: "",
        password: "",
        remember: false,
    });

    const loadPersonnes = async (etablissementId, role) => {
        if (!etablissementId || !role) {
            setPersonnes([]);
            return;
        }

        setLoadingPersonnes(true);

        try {
            const url =
                route("login.personnel-options") +
                `?etablissement_id=${encodeURIComponent(
                    etablissementId,
                )}&role=${encodeURIComponent(role)}`;

            console.log("URL personnelOptions :", url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            console.log("Statut HTTP :", response.status);

            if (!response.ok) {
                const text = await response.text();

                console.error("Réponse serveur :", text);

                throw new Error(`Erreur HTTP ${response.status}`);
            }

            const result = await response.json();

            console.log("Réponse personnelOptions :", result);
            console.log("Est un tableau :", Array.isArray(result));

            const liste = Array.isArray(result)
                ? result
                : Array.isArray(result.personnes)
                  ? result.personnes
                  : [];

            console.log("Liste finale :", liste);

            setPersonnes(liste);
        } catch (error) {
            console.error("Erreur chargement personnel :", error);

            setPersonnes([]);
        } finally {
            setLoadingPersonnes(false);
        }
    };

    useEffect(() => {
        if (mode !== "personnel") {
            return;
        }

        if (!data.etablissement_id || !data.role) {
            setPersonnes([]);
            return;
        }

        setData("mode", "personnel");
        setData("user_id", "");

        loadPersonnes(data.etablissement_id, data.role);
    }, [data.etablissement_id, data.role]);

    const handleEtablissementChange = (value) => {
        setData("etablissement_id", value);
        setData("role", "");
        setData("user_id", "");
        setPersonnes([]);
    };

    const handleRoleChange = (value) => {
        setData("role", value);
        setData("user_id", "");
        setPersonnes([]);
    };

    const switchMode = (newMode) => {
        setMode(newMode);

        setData({
            mode: newMode,
            email: "",
            etablissement_id: "",
            role: "",
            user_id: "",
            password: "",
            remember: false,
        });

        setRoles([]);
        setPersonnes([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("login"));
    };

    return (
        <>
            <Head title="Connexion" />

            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
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
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Connexion
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Accédez à votre espace personnel.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
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

                        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => switchMode("personnel")}
                                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                    mode === "personnel"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-500"
                                }`}
                            >
                                Personnel
                            </button>

                            <button
                                type="button"
                                onClick={() => switchMode("superadmin")}
                                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                    mode === "superadmin"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-500"
                                }`}
                            >
                                SuperAdmin
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {mode === "superadmin" ? (
                                <>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Adresse e-mail
                                        </label>

                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            autoComplete="username"
                                            autoFocus
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Établissement
                                        </label>

                                        <select
                                            value={data.etablissement_id}
                                            onChange={(e) =>
                                                handleEtablissementChange(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">
                                                Sélectionner votre
                                                établissement...
                                            </option>

                                            {etablissements.map(
                                                (etablissement) => (
                                                    <option
                                                        key={etablissement.id}
                                                        value={etablissement.id}
                                                    >
                                                        {etablissement.nom}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>

                                    {data.etablissement_id && (
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Fonction
                                            </label>

                                            <select
                                                value={data.role}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            >
                                                <option value="">
                                                    Sélectionner votre
                                                    fonction...
                                                </option>

                                                <option value="Administrateur">
                                                    Administrateur
                                                </option>

                                                <option value="Direction">
                                                    Direction
                                                </option>

                                                <option value="Professeur">
                                                    Professeur
                                                </option>

                                                <option value="Educateur">
                                                    Educateur
                                                </option>
                                            </select>
                                        </div>
                                    )}

                                    {data.role && (
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Nom et prénoms
                                            </label>

                                            <select
                                                value={data.user_id}
                                                onChange={(e) =>
                                                    setData(
                                                        "user_id",
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={loadingPersonnes}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                            >
                                                <option value="">
                                                    {loadingPersonnes
                                                        ? "Chargement..."
                                                        : "Sélectionner votre nom..."}
                                                </option>

                                                {personnes.map((personne) => (
                                                    <option
                                                        key={personne.id}
                                                        value={personne.id}
                                                    >
                                                        {personne.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {!loadingPersonnes &&
                                                personnes.length === 0 && (
                                                    <p className="mt-2 text-xs text-orange-600">
                                                        Aucun compte actif
                                                        disponible pour cette
                                                        sélection.
                                                    </p>
                                                )}
                                        </div>
                                    )}
                                </>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Mot de passe
                                </label>

                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    autoComplete="current-password"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    className="rounded border-slate-300"
                                />
                                Se souvenir de moi
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? "Connexion..." : "Se connecter"}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        © {new Date().getFullYear()} StatEval-CI
                    </p>
                </div>
            </div>
        </>
    );
}
