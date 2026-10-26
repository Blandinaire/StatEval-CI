import React, { useEffect, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Create({ roles = [], etablissements = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        fonction: "",
        role: "",
        etablissement_id: "",
        enseignant_id: "",
        educateur_id: "",
        etablissement_responsable_id: "",
        autre_personnel_id: "",
        actif: true,
    });

    const [personnes, setPersonnes] = useState([]);
    const [chargementPersonnes, setChargementPersonnes] = useState(false);

    const isSuperAdmin = data.role === "SuperAdmin";
    const isProfesseur = data.role === "Professeur";
    const isEducateur = data.role === "Educateur";
    const isDirection = data.role === "Direction";
    const isAdministrateur = data.role === "Administrateur";

    const isResponsable = isDirection || isAdministrateur;

    const personnelType = isProfesseur
        ? "enseignant"
        : isEducateur
          ? "educateur"
          : isResponsable
            ? "autre_personnel"
            : null;

    /*
    |--------------------------------------------------------------------------
    | CHANGEMENT DE RÔLE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setPersonnes([]);

        setData((previous) => ({
            ...previous,
            enseignant_id: "",
            educateur_id: "",
            etablissement_responsable_id: "",
            autre_personnel_id: "",
            name: "",
            email: "",
            fonction:
                data.role === "SuperAdmin"
                    ? "Super Administrateur"
                    : data.role === "Professeur"
                      ? "Professeur"
                      : data.role === "Educateur"
                        ? "Educateur"
                        : data.role === "Administrateur"
                          ? "Administrateur"
                          : "",
            ...(data.role === "SuperAdmin" ||
            data.role === "Professeur" ||
            data.role === "Educateur"
                ? { etablissement_id: "" }
                : {}),
        }));
    }, [data.role]);

    /*
    |--------------------------------------------------------------------------
    | CHARGEMENT DU PERSONNEL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let actif = true;

        setPersonnes([]);

        if (!data.role || !data.etablissement_id || !personnelType) {
            setChargementPersonnes(false);
            return () => {
                actif = false;
            };
        }

        setChargementPersonnes(true);

        window.axios
            .get(route("users.personnel-options"), {
                params: {
                    etablissement_id: data.etablissement_id,
                    role: data.role,
                },
            })
            .then((response) => {
                if (actif) {
                    setPersonnes(response.data.personnes ?? []);
                }
            })
            .catch(() => {
                if (actif) {
                    setPersonnes([]);
                }
            })
            .finally(() => {
                if (actif) {
                    setChargementPersonnes(false);
                }
            });

        return () => {
            actif = false;
        };
    }, [data.role, data.etablissement_id, personnelType]);

    /*
    |--------------------------------------------------------------------------
    | SÉLECTION DU PERSONNEL
    |--------------------------------------------------------------------------
    */

    const handlePersonneChange = (personneId) => {
        const personne = personnes.find(
            (item) => String(item.id) === String(personneId),
        );

        setData((previous) => ({
            ...previous,
            enseignant_id: "",
            educateur_id: "",
            etablissement_responsable_id: "",
            autre_personnel_id: "",
            name: "",
            email: "",
            fonction: isProfesseur
                ? "Professeur"
                : isEducateur
                  ? "Educateur"
                  : isAdministrateur
                    ? "Administrateur"
                    : "",
        }));

        if (!personne) {
            return;
        }

        const nomComplet = `${personne.nom ?? ""} ${
            personne.prenoms ?? ""
        }`.trim();

        setData((previous) => ({
            ...previous,
            enseignant_id: personnelType === "enseignant" ? personne.id : "",
            educateur_id: personnelType === "educateur" ? personne.id : "",
            etablissement_responsable_id:
                personnelType === "responsable" ? personne.id : "",
            autre_personnel_id:
                personnelType === "autre_personnel" ? personne.id : "",
            name: nomComplet,
            email: personne.email ?? "",
            fonction:
                personnelType === "enseignant"
                    ? "Professeur"
                    : personnelType === "educateur"
                      ? "Educateur"
                      : (personne.fonction ?? ""),
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | SOUMISSION
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("users.store"));
    };

    return (
        <AdminLayout>
            <Head title="Nouvel utilisateur" />

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Nouvel utilisateur
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Créer un compte et définir ses droits d'accès.
                        </p>
                    </div>

                    <Link
                        href={route("users.index")}
                        className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                    >
                        ← Retour à la liste
                    </Link>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
                        <h3 className="font-bold text-red-800">
                            Impossible de créer l'utilisateur
                        </h3>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-700">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field}>
                                    {Array.isArray(message)
                                        ? message.join(", ")
                                        : message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b bg-slate-50 px-6 py-5">
                            <h2 className="text-xl font-bold text-gray-900">
                                Rôle et affectation
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Le rôle détermine les droits d'accès de
                                l'utilisateur.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Rôle
                                    <span className="text-red-600"> *</span>
                                </label>

                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        setData("role", e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Sélectionner un rôle...
                                    </option>

                                    {roles
                                        .filter((role) =>
                                            [
                                                "SuperAdmin",
                                                "Administrateur",
                                                "Direction",
                                                "Professeur",
                                                "Educateur",
                                            ].includes(role.name),
                                        )
                                        .map((role) => (
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
                            </div>

                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Établissement
                                    {!isSuperAdmin && (
                                        <span className="text-red-600"> *</span>
                                    )}
                                </label>

                                <select
                                    value={data.etablissement_id}
                                    onChange={(e) =>
                                        setData(
                                            "etablissement_id",
                                            e.target.value,
                                        )
                                    }
                                    disabled={isSuperAdmin}
                                    className={`w-full rounded-lg border px-4 py-3 ${
                                        isSuperAdmin
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                                            : "border-gray-300 bg-white"
                                    }`}
                                >
                                    <option value="">
                                        {isSuperAdmin
                                            ? "Aucun établissement — accès global"
                                            : "Sélectionner un établissement..."}
                                    </option>

                                    {!isSuperAdmin &&
                                        etablissements.map((etablissement) => (
                                            <option
                                                key={etablissement.id}
                                                value={etablissement.id}
                                            >
                                                {etablissement.nom}
                                            </option>
                                        ))}
                                </select>

                                {isSuperAdmin && (
                                    <p className="mt-2 text-sm text-blue-600">
                                        Le SuperAdmin possède un accès global.
                                    </p>
                                )}

                                {(isProfesseur ||
                                    isEducateur ||
                                    isResponsable) && (
                                    <p className="mt-2 text-sm text-blue-600">
                                        Sélectionnez l'établissement pour
                                        afficher les personnes disponibles.
                                    </p>
                                )}

                                {errors.etablissement_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.etablissement_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {(isProfesseur || isEducateur || isResponsable) && (
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b bg-slate-50 px-6 py-5">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Personnel
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Sélectionnez une personne existante dans la
                                    base de données.
                                </p>
                            </div>

                            <div className="p-6">
                                <label className="mb-2 block font-semibold text-gray-700">
                                    {isProfesseur
                                        ? "Enseignant"
                                        : isEducateur
                                          ? "Éducateur"
                                          : "Autre personnel"}

                                    <span className="text-red-600"> *</span>
                                </label>

                                <select
                                    value={
                                        personnelType === "enseignant"
                                            ? data.enseignant_id
                                            : personnelType === "educateur"
                                              ? data.educateur_id
                                              : personnelType ===
                                                  "autre_personnel"
                                                ? data.autre_personnel_id
                                                : data.etablissement_responsable_id
                                    }
                                    onChange={(e) =>
                                        handlePersonneChange(e.target.value)
                                    }
                                    disabled={
                                        !data.etablissement_id ||
                                        chargementPersonnes
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        {!data.etablissement_id
                                            ? "Sélectionnez d'abord un établissement..."
                                            : chargementPersonnes
                                              ? "Chargement..."
                                              : "Sélectionner une personne..."}
                                    </option>

                                    {personnes.map((personne) => (
                                        <option
                                            key={personne.id}
                                            value={personne.id}
                                        >
                                            {personne.civilite
                                                ? `${personne.civilite} `
                                                : ""}
                                            {personne.nom} {personne.prenoms}
                                            {personne.fonction
                                                ? ` — ${personne.fonction}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>

                                {personnes.length === 0 &&
                                    data.etablissement_id &&
                                    !chargementPersonnes && (
                                        <p className="mt-2 text-sm text-orange-600">
                                            Aucune personne disponible pour ce
                                            rôle dans cet établissement.
                                        </p>
                                    )}

                                {errors.enseignant_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.enseignant_id}
                                    </p>
                                )}
                                {errors.educateur_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.educateur_id}
                                    </p>
                                )}
                                {errors.etablissement_responsable_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.etablissement_responsable_id}
                                    </p>
                                )}
                                {errors.autre_personnel_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.autre_personnel_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b bg-slate-50 px-6 py-5">
                            <h2 className="text-xl font-bold text-gray-900">
                                Informations du compte
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Certaines informations sont automatiquement
                                récupérées depuis la fiche du personnel.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Nom et prénoms
                                    <span className="text-red-600"> *</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    disabled={
                                        isProfesseur ||
                                        isEducateur ||
                                        isResponsable
                                    }
                                    className={`w-full rounded-lg border px-4 py-3 ${
                                        isProfesseur ||
                                        isEducateur ||
                                        isResponsable
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                                            : "border-gray-300 bg-white"
                                    }`}
                                    placeholder="Nom et prénoms"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block font-semibold text-gray-700">
                                        Adresse e-mail
                                    </label>
                                    {(isProfesseur ||
                                        isEducateur ||
                                        isResponsable) && (
                                        <span className="text-xs text-gray-500">
                                            Facultative sur la fiche, mais
                                            nécessaire pour le compte.
                                        </span>
                                    )}
                                </div>

                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    disabled={
                                        isProfesseur ||
                                        isEducateur ||
                                        isResponsable
                                    }
                                    placeholder="exemple@stateval.ci"
                                    className={`w-full rounded-lg border px-4 py-3 ${
                                        isProfesseur ||
                                        isEducateur ||
                                        isResponsable
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                                            : "border-gray-300 bg-white"
                                    }`}
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    L'adresse e-mail pourra servir
                                    ultérieurement à la récupération du compte.
                                </p>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Fonction
                                </label>
                                <input
                                    type="text"
                                    value={data.fonction}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                                />
                                {errors.fonction && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.fonction}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block font-semibold text-gray-700">
                                    Mot de passe initial
                                </label>
                                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                                    <strong>Généré automatiquement</strong>
                                    <p className="mt-1">
                                        Le mot de passe initial sera généré
                                        automatiquement par l'application et
                                        devra être changé lors de la première
                                        connexion.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="p-6">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.actif}
                                    onChange={(e) =>
                                        setData("actif", e.target.checked)
                                    }
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-semibold text-gray-800">
                                        Compte actif
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        L'utilisateur pourra se connecter.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href={route("users.index")}
                            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? "Création en cours..."
                                : "Créer le compte"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
