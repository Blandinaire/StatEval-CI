import { Link, usePage } from "@inertiajs/react";

export default function MenuItem({
    href,
    icon: Icon,
    children,
    activeMatch = null,
    onClick,
}) {
    const { url } = usePage();

    const active = activeMatch
        ? activeMatch.some((prefix) => url.startsWith(prefix))
        : url === href || url.startsWith(`${href}/`);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
        >
            <Icon size={20} className="shrink-0" />

            <span className="truncate">{children}</span>
        </Link>
    );
}
