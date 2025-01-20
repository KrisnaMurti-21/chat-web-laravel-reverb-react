import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({ users }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            You're logged in!
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                        {users.map((user) => (
                            <Link
                                key={user.id}
                                href={route("chat", user.id)}
                                className="p-6 mt-5 overflow-hidden bg-white shadow-sm rounded-lg border border-transparent hover:border-indigo-500 transition dark:bg-gray-800 dark:border-gray-700 dark:hover:border-indigo-500"
                            >
                                <h4 className="text-xl dark:text-gray-200">
                                    {user.name}
                                </h4>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
