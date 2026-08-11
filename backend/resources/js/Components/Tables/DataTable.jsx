export default function DataTable({
    columns = [],
    data = [],
    children,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <table className="min-w-full">

                <thead className="bg-gray-50">

                    <tr>

                        {columns.map((column) => (

                            <th
                                key={column.key}
                                className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                            >
                                {column.label}
                            </th>

                        ))}

                    </tr>

                </thead>

                <tbody>

                    {data.length === 0 ? (

                        <tr>

                            <td
                                colSpan={columns.length}
                                className="px-6 py-10 text-center text-gray-500"
                            >
                                Aucune donnée disponible
                            </td>

                        </tr>

                    ) : (

                        children

                    )}

                </tbody>

            </table>

        </div>
    );
}