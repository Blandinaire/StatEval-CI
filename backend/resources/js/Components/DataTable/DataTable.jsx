import { useMemo, useState } from "react";

export default function DataTable({
    title,
    columns,
    data,
    createLink,
    createLabel = "Nouveau",
}) {
    const [search, setSearch] = useState("");

    const filteredData = useMemo(() => {
        if (!search) return data;

        return data.filter((row) =>
            Object.values(row).some((value) =>
                String(value)
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        );
    }, [data, search]);

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-center">

                <div>

                    <h1 className="text-3xl font-bold">
                        {title}
                    </h1>

                    <p className="text-gray-500">
                        {filteredData.length} enregistrement(s)
                    </p>

                </div>

                {createLink && (
                    <a
                        href={createLink}
                        className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                    >
                        + {createLabel}
                    </a>
                )}

            </div>

            <div className="flex justify-between">

                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-80"
                />

            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>

                            {columns.map((column) => (

                                <th
                                    key={column.key}
                                    className="text-left p-4"
                                >
                                    {column.label}
                                </th>

                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        {filteredData.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={columns.length}
                                    className="text-center p-10 text-gray-500"
                                >
                                    Aucun résultat.
                                </td>

                            </tr>

                        ) : (

                            filteredData.map((row) => (

                                <tr
                                    key={row.id}
                                    className="border-t"
                                >

                                    {columns.map((column) => (

                                        <td
                                            key={column.key}
                                            className="p-4"
                                        >
                                            {column.render
                                                ? column.render(row)
                                                : row[column.key]}
                                        </td>

                                    ))}

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}