import Button from "@/Components/UI/Button";
import { Link } from "@inertiajs/react";

export default function ActionButtons({
    editHref,
    onDelete,
}) {
    return (
        <div className="flex justify-center gap-2">

            <Link href={editHref}>
                <Button>
                    Modifier
                </Button>
            </Link>

            <Button
                variant="danger"
                onClick={onDelete}
            >
                Supprimer
            </Button>

        </div>
    );
}