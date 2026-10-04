import {
    LayoutDashboard,
    School,
    CalendarDays,
    Layers,
    GraduationCap,
    Users,
    BookOpen,
    BookText,
    BarChart3,
    Settings,
    ClipboardList,
    ClipboardCheck,
    FileText,
    UserRound,
    UserX,
    Clock,
    X,
} from "lucide-react";

import { usePage } from "@inertiajs/react";

import MenuItem from "./MenuItem";
import SectionTitle from "./SectionTitle";

export default function Sidebar({ isOpen, closeSidebar }) {
    const { auth } = usePage().props;

    const user = auth?.user;

    // =========================================================
    // RÔLE
    // =========================================================

    const role = user?.roles?.[0]?.name ?? user?.role ?? "Utilisateur";

    // =========================================================
    // IDENTIFICATION DES RÔLES
    // =========================================================

    const isSuperAdmin = role === "SuperAdmin" || role === "Super Admin";

    const isAdmin = role === "Administrateur";

    const isDirection = role === "Direction";

    const isProfesseur = role === "Professeur";

    // IMPORTANT :
    // Le rôle enregistré dans la base est "Educateur"
    // et non "Éducateur".
    const isEducateur = role === "Educateur";

    // =========================================================
    // AUTORISATIONS
    // =========================================================

    // Référentiels :
    // SuperAdmin / Administrateur / Direction
    const canViewReferentiels = isSuperAdmin || isAdmin || isDirection;

    // Gestion des classes :
    // SuperAdmin / Administrateur / Direction
    const canManageClasses = isSuperAdmin || isAdmin || isDirection;

    // Gestion du personnel :
    // SuperAdmin / Administrateur / Direction
    const canManagePersonnel = isSuperAdmin || isAdmin || isDirection;

    // =========================================================
    // SCOLARITÉ
    // =========================================================

    // L'Éducateur peut consulter les élèves.
    const canManageScolarite =
        isSuperAdmin || isAdmin || isDirection || isEducateur;

    // =========================================================
    // VIE SCOLAIRE
    // =========================================================

    // L'Éducateur peut gérer/consulter :
    // - Conduite
    // - Absences
    // - Retards
    const canManageVieScolaire =
        isSuperAdmin || isAdmin || isDirection || isEducateur;

    // =========================================================
    // ÉVALUATIONS
    // =========================================================

    // L'Éducateur n'a PAS accès aux évaluations pédagogiques.
    const canManageEvaluations =
        isSuperAdmin || isAdmin || isDirection || isProfesseur;

    const canProgramEvaluations = isSuperAdmin || isAdmin || isDirection;

    // =========================================================
    // STATISTIQUES
    // =========================================================

    // L'Éducateur aura accès aux statistiques,
    // mais le backend devra limiter les données
    // à ses classes autorisées.
    const canViewStatistiques =
        isSuperAdmin || isAdmin || isDirection || isProfesseur || isEducateur;

    const canManageEducateurClasses =
        user?.role === "SuperAdmin" ||
        user?.role === "Administrateur" ||
        user?.role === "Direction";

    // =========================================================
    // SYSTÈME
    // =========================================================

    const canManageSystem = isSuperAdmin || isAdmin;

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50
                flex w-[min(18rem,85vw)] flex-col
                overflow-y-auto
                bg-slate-900 text-white
                shadow-xl
                transition-transform duration-300 ease-in-out

                ${isOpen ? "translate-x-0" : "-translate-x-full"}

                lg:w-72
                lg:translate-x-0
                lg:shadow-none
            `}
        >
            {/* =====================================================
                LOGO
            ===================================================== */}

            <div className="flex shrink-0 items-start justify-between border-b border-slate-700 p-5 sm:p-6">
                <div className="min-w-0">
                    <h1 className="truncate text-xl font-bold sm:text-2xl">
                        StatEval-CI
                    </h1>

                    <p className="text-sm text-slate-400">Gestion scolaire</p>
                </div>

                {/* =================================================
                    FERMETURE MOBILE
                ================================================= */}

                <button
                    type="button"
                    onClick={closeSidebar}
                    className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
                    aria-label="Fermer le menu"
                >
                    <X size={22} />
                </button>
            </div>

            {/* =====================================================
                MENU
            ===================================================== */}

            <nav className="min-h-0 flex-1 overflow-y-auto p-4">
                {/* =================================================
                    TABLEAU DE BORD
                ================================================= */}

                <SectionTitle>Tableau de bord</SectionTitle>

                <MenuItem
                    href="/dashboard"
                    icon={LayoutDashboard}
                    activeMatch={["/dashboard"]}
                    onClick={closeSidebar}
                >
                    Tableau de bord
                </MenuItem>

                {/* =================================================
                    RÉFÉRENTIELS
                ================================================= */}

                {canViewReferentiels && (
                    <>
                        <SectionTitle>Référentiels</SectionTitle>

                        <MenuItem
                            href="/etablissements"
                            icon={School}
                            activeMatch={["/etablissements"]}
                            onClick={closeSidebar}
                        >
                            Établissements
                        </MenuItem>

                        <MenuItem
                            href="/annee-scolaires"
                            icon={CalendarDays}
                            activeMatch={["/annee-scolaires"]}
                            onClick={closeSidebar}
                        >
                            Années scolaires
                        </MenuItem>

                        <MenuItem
                            href="/cycles"
                            icon={Layers}
                            activeMatch={["/cycles"]}
                            onClick={closeSidebar}
                        >
                            Cycles
                        </MenuItem>

                        <MenuItem
                            href="/niveaux"
                            icon={Layers}
                            activeMatch={["/niveaux"]}
                            onClick={closeSidebar}
                        >
                            Niveaux
                        </MenuItem>

                        <MenuItem
                            href="/series"
                            icon={Layers}
                            activeMatch={["/series"]}
                            onClick={closeSidebar}
                        >
                            Séries
                        </MenuItem>

                        <MenuItem
                            href="/matieres"
                            icon={BookText}
                            activeMatch={["/matieres"]}
                            onClick={closeSidebar}
                        >
                            Matières
                        </MenuItem>

                        <MenuItem
                            href="/maquettes"
                            icon={BookOpen}
                            activeMatch={["/maquettes"]}
                            onClick={closeSidebar}
                        >
                            Maquettes pédagogiques
                        </MenuItem>
                    </>
                )}

                {/* =================================================
                    ADMINISTRATION
                ================================================= */}

                {canManageClasses && (
                    <>
                        <SectionTitle>Administration</SectionTitle>

                        <MenuItem
                            href="/classes"
                            icon={BookOpen}
                            activeMatch={["/classes"]}
                            onClick={closeSidebar}
                        >
                            Classes
                        </MenuItem>
                    </>
                )}

                {(isProfesseur || isEducateur) && (
                    <>
                        <SectionTitle>
                            {isProfesseur ? "Mes classes" : "Classes"}
                        </SectionTitle>

                        <MenuItem
                            href="/classes"
                            icon={BookOpen}
                            activeMatch={["/classes"]}
                            onClick={closeSidebar}
                        >
                            Classes
                        </MenuItem>
                    </>
                )}

                {/* =================================================
                    PERSONNEL
                ================================================= */}

                {canManagePersonnel && (
                    <>
                        <SectionTitle>Personnel</SectionTitle>

                        <MenuItem
                            href="/enseignants"
                            icon={Users}
                            activeMatch={["/enseignants"]}
                            onClick={closeSidebar}
                        >
                            Enseignants
                        </MenuItem>

                        <MenuItem
                            href="/affectations"
                            icon={ClipboardList}
                            activeMatch={["/affectations"]}
                            onClick={closeSidebar}
                        >
                            Affectations enseignants
                        </MenuItem>

                        <MenuItem
                            href="/educateurs"
                            icon={UserRound}
                            activeMatch={["/educateurs"]}
                            onClick={closeSidebar}
                        >
                            Éducateurs
                        </MenuItem>

                        <MenuItem
                            href="/educateur-classes"
                            icon={Users}
                            activeMatch={["/educateur-classes"]}
                            onClick={closeSidebar}
                        >
                            Affectation éducateurs
                        </MenuItem>
                    </>
                )}

                {/* =================================================
                    VIE SCOLAIRE
                ================================================= */}

                {canManageVieScolaire && (
                    <>
                        <SectionTitle>Vie scolaire</SectionTitle>

                        {/* -------------------------------
                            CONDUITE
                        -------------------------------- */}

                        <MenuItem
                            href="/conduites"
                            icon={ClipboardCheck}
                            activeMatch={["/conduites"]}
                            onClick={closeSidebar}
                        >
                            Conduite
                        </MenuItem>

                        {/* -------------------------------
                            ABSENCES
                        -------------------------------- */}

                        <MenuItem
                            href="/absences"
                            icon={UserX}
                            activeMatch={["/absences"]}
                            onClick={closeSidebar}
                        >
                            Absences
                        </MenuItem>

                        {/* -------------------------------
                            RETARDS
                        -------------------------------- */}

                        <MenuItem
                            href="/retards"
                            icon={Clock}
                            activeMatch={["/retards"]}
                            onClick={closeSidebar}
                        >
                            Retards
                        </MenuItem>
                    </>
                )}

                {/* =================================================
                    SCOLARITÉ
                ================================================= */}

                {canManageScolarite && (
                    <>
                        <SectionTitle>Scolarité</SectionTitle>

                        <MenuItem
                            href="/eleves"
                            icon={GraduationCap}
                            activeMatch={["/eleves"]}
                            onClick={closeSidebar}
                        >
                            Élèves
                        </MenuItem>
                    </>
                )}

                {/* =================================================
                    ÉVALUATIONS
                ================================================= */}

                {canManageEvaluations && (
                    <>
                        <SectionTitle>Évaluations</SectionTitle>

                        <MenuItem
                            href="/evaluations"
                            icon={ClipboardCheck}
                            activeMatch={["/evaluations"]}
                            exact
                            onClick={closeSidebar}
                        >
                            Évaluations
                        </MenuItem>

                        {canProgramEvaluations && (
                            <MenuItem
                                href="/evaluations/programmer"
                                icon={ClipboardCheck}
                                activeMatch={["/evaluations/programmer"]}
                                onClick={closeSidebar}
                            >
                                Programmer une évaluation
                            </MenuItem>
                        )}

                        {canProgramEvaluations && (
                            <>
                                <MenuItem
                                    href="/evaluations/programmations"
                                    icon={ClipboardCheck}
                                    activeMatch={[
                                        "/evaluations/programmations",
                                    ]}
                                    onClick={closeSidebar}
                                >
                                    Programmations
                                </MenuItem>
                                <MenuItem
                                    href="/evaluations/calendrier"
                                    icon={ClipboardCheck}
                                    activeMatch={["/evaluations/calendrier"]}
                                    onClick={closeSidebar}
                                >
                                    Calendrier
                                </MenuItem>
                            </>
                        )}

                        <MenuItem
                            href="/notes"
                            icon={FileText}
                            activeMatch={["/notes"]}
                            onClick={closeSidebar}
                        >
                            Saisie des notes
                        </MenuItem>
                    </>
                )}

                {/* =================================================
                    STATISTIQUES
                ================================================= */}

                {canViewStatistiques && (
                    <>
                        <SectionTitle>Statistiques</SectionTitle>

                        <MenuItem
                            href="/statistiques"
                            icon={BarChart3}
                            activeMatch={["/statistiques"]}
                            onClick={closeSidebar}
                        >
                            Statistiques
                        </MenuItem>
                    </>
                )}

                {/* =================================================
                    SYSTÈME
                ================================================= */}

                {canManageSystem && (
                    <>
                        <SectionTitle>Système</SectionTitle>

                        <MenuItem
                            href="/users"
                            icon={Users}
                            activeMatch={["/users"]}
                            onClick={closeSidebar}
                        >
                            Utilisateurs
                        </MenuItem>

                        <MenuItem
                            href="/parametres"
                            icon={Settings}
                            activeMatch={["/parametres"]}
                            onClick={closeSidebar}
                        >
                            Paramètres
                        </MenuItem>
                    </>
                )}
            </nav>
        </aside>
    );
}
