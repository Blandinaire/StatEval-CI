import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Edit({
    user,
    roles = [],
    etablissements = [],
}) {
    const currentRole =
        user?.roles?.length > 0 ? user.roles[0].name : "";

    const { data, setData, put, processing, errors } = useForm({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: "",
        fonction:
            currentRole === "SuperAdmin"
                ? "Super Administrateur"
                : user?.fonction ?? "",
        role: currentRole,

        // IMPORTANT :
        // Un SuperAdmin ne doit jamais avoir d'établissement.
        etablissement_id:
            currentRole === "SuperAdmin"
                ? ""
                : user?.etablissement_id ?? "",

        actif: user?.actif ?? true,
    });

    const [showPassword, setShowPassword] = useState(false);

    const directionFunctions = [
        "Directeur des Études",
        "Proviseur",
        "Responsable pédagogique",
        "Directeur adjoint",
        "Responsable de la vie scolaire",
        "Coordonnateur pédagogique",
        "Autre",
    ];

    const isDirection = data.role === "Direction";
    const isSuperAdmin = data.role === "SuperAdmin";

    /**
     * Changement de rôle
     */
    const handleRoleChange = (role) => {
        setData("role", role);

        // SUPER ADMINISTRATEUR
        if (role === "SuperAdmin") {
            setData("fonction", "Super Administrateur");
            setData("etablissement_id", "");
            return;
        }

        // ADMINISTRATEUR
        if (role === "Administrateur") {
            setData("fonction", "Administrateur");
            return;
        }

        // PROFESSEUR
        if (role === "Professeur") {
            setData("fonction", "Professeur");
            return;
        }

        // EDUCATEUR
        if (role === "Educateur") {
            setData("fonction", "Educateur");
            return;
        }

        // ELEVE
        if (role === "Élève") {
            setData("fonction", "Élève");
            return;
        }

        // PARENT
        if (role === "Parent") {
            setData("fonction", "Parent");
            return;
        }

        // DIRECTION
        if (role === "Direction") {
            setData("fonction", "");
            return;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route("users.update", user.id));
    };

    return (
        <AdminLayout>
            <Head title="Modifier l'utilisateur" />

            <div className="mx-auto max-w-5xl px-6 py-8">

                {/* EN-TÊTE */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Modifier l'utilisateur
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Modifier les informations et les droits
                            d'accès du compte.
                        </p>
                    </div>

                    <Link
                        href={route("users.index")}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        ← Retour à la liste
                    </Link>
                </div>

                {/* ERREURS */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
                        <h3 className="font-bold text-red-800">
                            Impossible de modifier l'utilisateur
                        </h3>

                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-700">
                            {Object.entries(errors).map(
                                ([field, message]) => (
                                    <li key={field}>{message}</li>
                                )
                            )}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* INFORMATIONS DU COMPTE */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b bg-slate-50 px-6 py-5">
                            <h2 className="text-xl font-bold text-gray-900">
                                Informations du compte
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Informations permettant d'identifier
                                l'utilisateur.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                            {/* NOM */}
                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Nom et prénom
                                    <span className="text-red-600"> *</span>
                                </label>

                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                />

                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Adresse e-mail
                                    <span className="text-red-600"> *</span>
                                </label>

                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                />

                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* MOT DE PASSE */}
                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Nouveau mot de passe
                                </label>

                                <div className="relative">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Laisser vide pour conserver l'actuel"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-24 focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600"
                                    >
                                        {showPassword
                                            ? "Masquer"
                                            : "Afficher"}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* FONCTION */}
                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Fonction
                                </label>

                                {isDirection ? (
                                    <select
                                        value={data.fonction}
                                        onChange={(e) =>
                                            setData(
                                                "fonction",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Sélectionner une fonction...
                                        </option>

                                        {directionFunctions.map(
                                            (fonction) => (
                                                <option
                                                    key={fonction}
                                                    value={fonction}
                                                >
                                                    {fonction}
                                                </option>
                                            )
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={data.fonction}
                                        onChange={(e) =>
                                            setData(
                                                "fonction",
                                                e.target.value
                                            )
                                        }
                                        disabled={isSuperAdmin}
                                        className={`w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:ring-blue-500 ${
                                            isSuperAdmin
                                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                )}

                                {isSuperAdmin && (
                                    <p className="mt-2 text-sm text-blue-600">
                                        La fonction est automatiquement définie
                                        pour le SuperAdmin.
                                    </p>
                                )}

                                {errors.fonction && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.fonction}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RÔLE ET AFFECTATION */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b bg-slate-50 px-6 py-5">
                            <h2 className="text-xl font-bold text-gray-900">
                                Rôle et affectation
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Le rôle détermine les droits d'accès dans
                                SchoolManager CI.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                            {/* RÔLE */}
                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Rôle
                                    <span className="text-red-600"> *</span>
                                </label>

                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        handleRoleChange(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Sélectionner un rôle...
                                    </option>

                                    {roles.map((role) => (
                                        <option
                                            key={role.id}
                                            value={role.name}
                                        >
                                            {role.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.role && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.role}
                                    </p>
                                )}

                                {data.role && (
                                    <div className="mt-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                        <strong>Rôle sélectionné :</strong>{" "}
                                        {data.role}
                                    </div>
                                )}
                            </div>

                            {/* ETABLISSEMENT */}
                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Établissement
                                </label>

                                <select
                                    value={
                                        isSuperAdmin
                                            ? ""
                                            : data.etablissement_id
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "etablissement_id",
                                            e.target.value
                                        )
                                    }
                                    disabled={isSuperAdmin}
                                    className={`w-full rounded-lg border px-4 py-3 ${
                                        isSuperAdmin
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                            : "border-gray-300 bg-white"
                                    }`}
                                >
                                    <option value="">
                                        {isSuperAdmin
                                            ? "Aucun établissement — accès global"
                                            : "Aucun établissement"}
                                    </option>

                                    {!isSuperAdmin &&
                                        etablissements.map(
                                            (etablissement) => (
                                                <option
                                                    key={etablissement.id}
                                                    value={etablissement.id}
                                                >
                                                    {etablissement.nom}
                                                </option>
                                            )
                                        )}
                                </select>

                                {isSuperAdmin && (
                                    <p className="mt-2 text-sm text-blue-600">
                                        Le SuperAdmin possède un accès global
                                        à tous les établissements. Aucun
                                        établissement ne doit lui être
                                        attribué.
                                    </p>
                                )}

                                {!isSuperAdmin &&
                                    errors.etablissement_id && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.etablissement_id}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* STATUT */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

                        <div className="p-6">
                            <label className="flex cursor-pointer items-center gap-3">

                                <input
                                    type="checkbox"
                                    checked={data.actif}
                                    onChange={(e) =>
                                        setData(
                                            "actif",
                                            e.target.checked
                                        )
                                    }
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                <div>
                                    <div className="font-semibold text-gray-800">
                                        Compte actif
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        Autoriser cet utilisateur à se
                                        connecter.
                                    </div>
                                </div>

                            </label>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4">

                        <Link
                            href={route("users.index")}
                            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? "Enregistrement..."
                                : "Enregistrer les modifications"}
                        </button>

                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}