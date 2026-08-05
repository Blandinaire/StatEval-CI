import Button from "@/Components/UI/Button";
import { Link } from "@inertiajs/react";

export default function PageHeader({
    title,
    subtitle = "",
    buttonLabel = null,
    buttonHref = null,
}) {
    return (
        <div className="flex items-center justify-between mb-8">

            <div>
                <h1 className="text-3xl font-bold text-slate-800">
                    {title}
                </h1>

                {subtitle && (
                    <p className="text-slate-500 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {buttonLabel && buttonHref && (
                <Link href={buttonHref}>
                    <Button>
                        {buttonLabel}
                    </Button>
                </Link>
            )}

        </div>
    );
}