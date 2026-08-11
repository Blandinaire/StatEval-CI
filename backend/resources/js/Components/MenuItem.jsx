import { Link, usePage } from "@inertiajs/react";

export default function MenuItem({
    href,
    icon: Icon,
    children,
    activeMatch = null,
}) {
    const { url } = usePage();

    const active = activeMatch
        ? activeMatch.some((prefix) => url.startsWith(prefix))
        : url === href || url.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition
                ${
                    active
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
        >
            <Icon size={20} />

            <span>{children}</span>
        </Link>
    );
}