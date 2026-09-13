import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Building2,
    Plus,
    Eye,
    MapPin,
    Phone,
    Pencil,
    Users,
    Mail,
} from "lucide-react";

export default function Index({
    etablissement = null,
    etablissements = [],
    responsables: responsablesProp = [],
}) {
    /*
    |--------------------------------------------------------------------------
    | DÉTERMINATION DU MODE
    |--------------------------------------------------------------------------
    */

    const mode = etablissement ? "etablissement" : "superadmin";

    /*
    |--------------------------------------------------------------------------
    | NORMALISATION DES RESPONSABLES
    |--------------------------------------------------------------------------
    |
    | Les responsables peuvent arriver de plusieurs manières :
    |
    | 1. responsables = [...]
    | 2. responsables = { data: [...] }   (pagination Laravel)
    | 3. etablissement.responsables = [...]
    | 4. etablissement.responsables = { data: [...] }
    |
    */

    const responsables = (() => {
        /*
        |--------------------------------------------------------------
        | RESPONSABLES REÇUS DIRECTEMENT
        |--------------------------------------------------------------
        */

        if (Array.isArray(responsablesProp)) {
            if (responsablesProp.length > 0) {
                return responsablesProp;
            }
        }

        /*
        |--------------------------------------------------------------
        | RESPONSABLES PAGINÉS
        |--------------------------------------------------------------
        */

        if (responsablesProp && Array.isArray(responsablesProp.data)) {
            return responsablesProp.data;
        }

        /*
        |--------------------------------------------------------------
        | RESPONSABLES DANS L'ÉTABLISSEMENT
        |--------------------------------------------------------------
        */

        if (etablissement && Array.isArray(etablissement.responsables)) {
            return etablissement.responsables;
        }

        /*
        |--------------------------------------------------------------
        | RESPONSABLES PAGINÉS DANS L'ÉTABLISSEMENT
        |--------------------------------------------------------------
        */

        if (
            etablissement &&
            etablissement.responsables &&
            Array.isArray(etablissement.responsables.data)
        ) {
            return etablissement.responsables.data;
        }

        return [];
    })();

    /*
    |--------------------------------------------------------------------------
    | MODE ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

    if (mode === "etablissement" && etablissement) {
        return (
            <AdminLayout>
                <Head title="Mon établissement" />

                <div className="mx-auto max-w-7xl space-y-6">
                    {/* =====================================================
                        EN-TÊTE
                    ===================================================== */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                                    <Building2 size={28} />
                                </div>

                                <div>
                                    <h1 className="text-3xl font-bold text-slate-800">
                                        Mon établissement
                                    </h1>

                                    <p className="mt-1 text-gray-500">
                                        Consultez et mettez à jour les
                                        informations de votre établissement.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={route(
                                "etablissements.edit",
                                etablissement.id,
                            )}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            <Pencil size={18} />
                            Modifier la fiche
                        </Link>
                    </div>

                    {/* =====================================================
                        CARTE PRINCIPALE
                    ===================================================== */}

                    <div className="overflow-hidden rounded-2xl bg-white shadow">
                        {/* =================================================
                            EN-TÊTE ÉTABLISSEMENT
                        ================================================= */}

                        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-10 text-white">
                            <div className="flex flex-col gap-6 md:flex-row md:items-center">
                                {/* LOGO */}

                                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow">
                                    {etablissement.logo ? (
                                        <img
                                            src={`/storage/${etablissement.logo}`}
                                            alt={etablissement.nom}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <Building2
                                            size={48}
                                            className="text-blue-600"
                                        />
                                    )}
                                </div>

                                {/* IDENTITÉ */}

                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold">
                                        {etablissement.nom}
                                    </h2>

                                    {etablissement.sigle && (
                                        <p className="mt-1 text-lg text-blue-100">
                                            {etablissement.sigle}
                                        </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {etablissement.code && (
                                            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                                                Code : {etablissement.code}
                                            </span>
                                        )}

                                        {etablissement.type && (
                                            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                                                {etablissement.type}
                                            </span>
                                        )}

                                        {etablissement.actif ? (
                                            <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">
                                                ✓ Actif
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">
                                                Inactif
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            INFORMATIONS
                        ================================================= */}

                        <div className="grid gap-8 p-8 lg:grid-cols-2">
                            {/* =============================================
                                INFORMATIONS GÉNÉRALES
                            ============================================= */}

                            <section className="rounded-xl border border-slate-200 p-6">
                                <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-800">
                                    <Building2
                                        size={22}
                                        className="text-blue-600"
                                    />
                                    Informations générales
                                </h3>

                                <div className="space-y-4">
                                    <InfoRow
                                        label="Nom complet"
                                        value={etablissement.nom}
                                    />

                                    <InfoRow
                                        label="Sigle"
                                        value={etablissement.sigle}
                                    />

                                    <InfoRow
                                        label="Devise"
                                        value={etablissement.devise}
                                    />

                                    <InfoRow
                                        label="Slogan"
                                        value={etablissement.slogan}
                                    />

                                    <InfoRow
                                        label="Type d'établissement"
                                        value={etablissement.type}
                                    />
                                </div>
                            </section>

                            {/* =============================================
                                LOCALISATION
                            ============================================= */}

                            <section className="rounded-xl border border-slate-200 p-6">
                                <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-800">
                                    <MapPin
                                        size={22}
                                        className="text-red-500"
                                    />
                                    Localisation
                                </h3>

                                <div className="space-y-4">
                                    <InfoRow
                                        label="Commune"
                                        value={etablissement.commune}
                                    />

                                    <InfoRow
                                        label="Ville"
                                        value={etablissement.ville}
                                    />

                                    <InfoRow
                                        label="Quartier"
                                        value={etablissement.quartier}
                                    />

                                    <InfoRow
                                        label="Région"
                                        value={etablissement.region}
                                    />

                                    <InfoRow
                                        label="Adresse"
                                        value={etablissement.adresse}
                                    />
                                </div>
                            </section>

                            {/* =============================================
                                CONTACTS
                            ============================================= */}

                            <section className="rounded-xl border border-slate-200 p-6">
                                <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-800">
                                    <Phone
                                        size={22}
                                        className="text-green-600"
                                    />
                                    Contacts
                                </h3>

                                <div className="space-y-4">
                                    <InfoRow
                                        label="Téléphone"
                                        value={etablissement.telephone}
                                    />

                                    <InfoRow
                                        label="Téléphone secondaire"
                                        value={
                                            etablissement.telephone_secondaire
                                        }
                                    />

                                    <InfoRow
                                        label="WhatsApp"
                                        value={etablissement.whatsapp}
                                    />

                                    <InfoRow
                                        label="E-mail"
                                        value={etablissement.email}
                                    />

                                    <InfoRow
                                        label="Site web"
                                        value={etablissement.site_web}
                                    />
                                </div>
                            </section>

                            {/* =============================================
                                ADMINISTRATION ÉDUCATIVE
                            ============================================= */}

                            <section className="rounded-xl border border-slate-200 p-6">
                                <h3 className="mb-5 text-xl font-bold text-slate-800">
                                    Administration éducative
                                </h3>

                                <div className="space-y-4">
                                    <InfoRow
                                        label="Direction régionale"
                                        value={
                                            etablissement.direction_regionale
                                        }
                                    />

                                    <InfoRow
                                        label="Inspection / IEPP"
                                        value={etablissement.inspection}
                                    />

                                    <InfoRow
                                        label="Académie"
                                        value={etablissement.academie}
                                    />
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* =====================================================
                        RESPONSABLES
                    ===================================================== */}

                    <section className="rounded-2xl bg-white p-6 shadow">
                        {/* =================================================
                            EN-TÊTE RESPONSABLES
                        ================================================= */}

                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                                        <Users size={24} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">
                                            Responsables de l'établissement
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Fondateur, direction et autres
                                            responsables enregistrés.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                {/* GÉRER */}

                                <Link
                                    href={route(
                                        "etablissements.responsables.index",
                                        etablissement.id,
                                    )}
                                    className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                                >
                                    Gérer les responsables
                                </Link>

                                {/* AJOUTER */}

                                <Link
                                    href={route(
                                        "etablissements.responsables.create",
                                        etablissement.id,
                                    )}
                                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    + Ajouter un responsable
                                </Link>
                            </div>
                        </div>

                        {/* =================================================
                            LISTE DES RESPONSABLES
                        ================================================= */}

                        <div className="mt-6">
                            {responsables.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                    <Users
                                        size={36}
                                        className="mx-auto text-slate-400"
                                    />

                                    <p className="mt-3 text-sm font-medium text-slate-600">
                                        Aucun responsable enregistré pour cet
                                        établissement.
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Ajoutez un fondateur, directeur,
                                        censeur, administrateur ou autre
                                        responsable.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {responsables.map((responsable) => (
                                        <ResponsableCard
                                            key={responsable.id}
                                            responsable={responsable}
                                            etablissement={etablissement}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </AdminLayout>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | MODE SUPERADMIN
    |--------------------------------------------------------------------------
    */

    return (
        <AdminLayout>
            <Head title="Établissements" />

            <div className="mx-auto max-w-7xl">
                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Établissements
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Gestion des établissements de la plateforme.
                        </p>
                    </div>

                    <Link
                        href={route("etablissements.create")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Nouvel établissement
                    </Link>
                </div>

                {/* =====================================================
                    TABLEAU
                ===================================================== */}

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Établissement
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Ville
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        Téléphone
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                        E-mail
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                                        Statut
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {etablissements.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            Aucun établissement enregistré.
                                        </td>
                                    </tr>
                                ) : (
                                    etablissements.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b last:border-b-0 hover:bg-slate-50"
                                        >
                                            {/* ÉTABLISSEMENT */}

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-blue-50">
                                                        {item.logo ? (
                                                            <img
                                                                src={`/storage/${item.logo}`}
                                                                alt={item.nom}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        ) : (
                                                            <Building2
                                                                size={20}
                                                                className="text-blue-600"
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {item.nom}
                                                        </p>

                                                        {item.code && (
                                                            <p className="text-xs text-slate-500">
                                                                Code :{" "}
                                                                {item.code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* VILLE */}

                                            <td className="px-5 py-4 text-slate-700">
                                                {item.ville || "—"}
                                            </td>

                                            {/* TÉLÉPHONE */}

                                            <td className="px-5 py-4 text-slate-700">
                                                {item.telephone || "—"}
                                            </td>

                                            {/* EMAIL */}

                                            <td className="px-5 py-4 text-slate-700">
                                                {item.email || "—"}
                                            </td>

                                            {/* STATUT */}

                                            <td className="px-5 py-4 text-center">
                                                {item.actif ? (
                                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                                                        Actif
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                                                        Inactif
                                                    </span>
                                                )}
                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    <Link
                                                        href={route(
                                                            "etablissements.show",
                                                            item.id,
                                                        )}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                                                    >
                                                        <Eye size={17} />
                                                        Voir
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

/*
|--------------------------------------------------------------------------
| CARTE RESPONSABLE
|--------------------------------------------------------------------------
*/

function ResponsableCard({ responsable, etablissement }) {
    const initiales = `${responsable.prenoms?.charAt(0) || ""}${
        responsable.nom?.charAt(0) || ""
    }`.toUpperCase();

    const civilite =
        responsable.civilite === "Monsieur"
            ? "M. "
            : responsable.civilite === "Madame"
              ? "Mme "
              : "";

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            {/* =========================================================
                IDENTITÉ
            ========================================================= */}

            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {initiales || "R"}
                    </div>

                    <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800">
                            {formatCivilite(responsable.civilite) && (
                                <>{formatCivilite(responsable.civilite)} </>
                            )}

                            {responsable.nom}
                        </h3>

                        {responsable.prenoms && (
                            <p className="text-sm text-slate-500">
                                {responsable.prenoms}
                            </p>
                        )}

                        {responsable.est_principal && (
                            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                Responsable principal
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* =========================================================
                FONCTION
            ========================================================= */}

            <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="font-semibold text-blue-600">
                    {responsable.fonction || "Fonction non renseignée"}
                </p>

                {/* =====================================================
                    CONTACTS
                ===================================================== */}

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                    {responsable.telephone && (
                        <div className="flex items-center gap-2">
                            <Phone
                                size={15}
                                className="shrink-0 text-green-600"
                            />

                            <span>{responsable.telephone}</span>
                        </div>
                    )}

                    {responsable.whatsapp && (
                        <div className="flex items-center gap-2">
                            <Phone
                                size={15}
                                className="shrink-0 text-emerald-600"
                            />

                            <span>WhatsApp : {responsable.whatsapp}</span>
                        </div>
                    )}

                    {responsable.email && (
                        <div className="flex items-start gap-2">
                            <Mail
                                size={15}
                                className="mt-0.5 shrink-0 text-blue-600"
                            />

                            <span className="break-all">
                                {responsable.email}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================================
                PIED
            ========================================================= */}

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        responsable.actif
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                    }`}
                >
                    {responsable.actif ? "Actif" : "Inactif"}
                </span>

                <Link
                    href={route("etablissements.responsables.edit", [
                        etablissement.id,
                        responsable.id,
                    ])}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                >
                    <Pencil size={15} />
                    Modifier
                </Link>
            </div>
        </div>
    );
}

const formatCivilite = (civilite) => {
    if (!civilite) {
        return "";
    }

    const valeur = civilite.trim().toLowerCase();

    if (valeur === "monsieur" || valeur === "m." || valeur === "m") {
        return "M.";
    }

    if (valeur === "madame" || valeur === "mme." || valeur === "mme") {
        return "Mme";
    }

    return civilite;
};

/*
|--------------------------------------------------------------------------
| COMPOSANT INFORMATION
|--------------------------------------------------------------------------
*/

function InfoRow({ label, value }) {
    return (
        <div className="border-b border-slate-100 pb-3 last:border-b-0">
            <p className="text-sm text-slate-500">{label}</p>

            <p className="mt-1 font-medium text-slate-800">
                {value || "Non renseigné"}
            </p>
        </div>
    );
}
