import AdminLayout from "@/Layouts/AdminLayout";
import Form from "./Form";

export default function Create(props) {
    return (
        <AdminLayout>

            <Form {...props} />

        </AdminLayout>
    );
}