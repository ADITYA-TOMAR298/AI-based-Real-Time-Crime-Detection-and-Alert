import useAuth from "../../hooks/useAuth";

export default function Profile() {

    const { user } = useAuth();

    return (

        <div className="min-h-screen bg-slate-950 text-white p-8">

            <h1 className="text-4xl font-bold mb-8">

                Profile

            </h1>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 max-w-xl">

                <img
                    src={user.photoURL}
                    alt=""
                    className="w-28 h-28 rounded-full mb-6"
                />

                <h2 className="text-2xl font-bold">

                    {user.displayName}

                </h2>

                <p className="text-slate-400">

                    {user.email}

                </p>

                <div className="mt-8">

                    <div className="flex justify-between border-b border-slate-800 py-3">

                        <span>Authentication</span>

                        <span>Google OAuth</span>

                    </div>

                    <div className="flex justify-between border-b border-slate-800 py-3">

                        <span>Role</span>

                        <span>Administrator</span>

                    </div>

                </div>

            </div>

        </div>

    );

}