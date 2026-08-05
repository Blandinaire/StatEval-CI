export default function EmptyState({
    message = "Aucune donnée disponible.",
}) {
    return (
        <div className="py-16 text-center">

            <div className="text-6xl mb-4">
                📂
            </div>

            <p className="text-gray-500">
                {message}
            </p>

        </div>
    );
}