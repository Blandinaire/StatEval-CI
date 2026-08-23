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
} from "lucide-react";

import MenuItem from "./MenuItem";
import SectionTitle from "./SectionTitle";

export default function Sidebar() {
    return (
        <aside className="min-h-screen w-72 bg-slate-900 text-white">
            <div className="border-b border-slate-700 p-6">
                <h1 className="text-2xl font-bold">StatEval-CI</h1>

                <p className="text-sm text-slate-400">Gestion scolaire</p>
            </div>

            <div className="p-4">
                <SectionTitle>Tableau de bord</SectionTitle>

                <MenuItem href="/dashboard" icon={LayoutDashboard}>
                    Tableau de bord
                </MenuItem>

                <SectionTitle>Administration</SectionTitle>

                <MenuItem href="/etablissements" icon={School}>
                    Établissements
                </MenuItem>

                <MenuItem href="/annee-scolaires" icon={CalendarDays}>
                    Années scolaires
                </MenuItem>

                <MenuItem href="/cycles" icon={Layers}>
                    Cycles
                </MenuItem>

                <MenuItem href="/niveaux" icon={Layers}>
                    Niveaux
                </MenuItem>

                <MenuItem href="/classes" icon={BookOpen}>
                    Classes
                </MenuItem>

                <MenuItem href="/matieres" icon={BookText}>
                    Matières
                </MenuItem>

                <MenuItem href="/maquettes" icon={BookOpen}>
                    Maquettes pédagogiques
                </MenuItem>

                <SectionTitle>Personnel</SectionTitle>

                <MenuItem href="/enseignants" icon={Users}>
                    Enseignants
                </MenuItem>

                <MenuItem href="/educateurs" icon={UserRound}>
                    Éducateurs
                </MenuItem>

                <MenuItem href="/affectations" icon={ClipboardList}>
                    Affectations
                </MenuItem>

                <SectionTitle>Vie scolaire</SectionTitle>

                <MenuItem href="/conduites" icon={ClipboardCheck}>
                    Conduite
                </MenuItem>

                <MenuItem href="/absences" icon={UserX}>
                    Absences
                </MenuItem>

                <MenuItem href="/retards" icon={Clock}>
                    Retards
                </MenuItem>

                <SectionTitle>Scolarité</SectionTitle>

                <MenuItem href="/eleves" icon={GraduationCap}>
                    Élèves
                </MenuItem>

                <SectionTitle>Évaluations</SectionTitle>

                <MenuItem
                    href="/evaluations"
                    icon={ClipboardCheck}
                    activeMatch={["/evaluations"]}
                >
                    Évaluations
                </MenuItem>

                <MenuItem
                    href="/notes"
                    icon={FileText}
                    activeMatch={["/notes"]}
                >
                    Saisie des notes
                </MenuItem>

                <SectionTitle>Statistiques</SectionTitle>

                <MenuItem href="/statistiques" icon={BarChart3}>
                    Statistiques
                </MenuItem>

                <SectionTitle>Système</SectionTitle>

                <MenuItem href="/parametres" icon={Settings}>
                    Paramètres
                </MenuItem>
            </div>
        </aside>
    );
}
