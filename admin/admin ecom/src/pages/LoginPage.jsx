import React, { useContext, useState } from "react";
import { useLoginContext } from "../context/LoginContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login } = useLoginContext();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await login(username, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="w-full flex items-center justify-center bg-[#F5F5F5] min-h-screen p-4 overflow-auto">
            <form
                className="bg-white flex flex-col rounded-lg px-6 md:px-10 w-full max-w-md py-8 shadow-lg"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-center mb-6">
                        Chào mừng Admin!
                    </h1>
                </div>
                <div className="form-control my-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <input
                        type="text"
                        className="bg-transparent focus:outline-none p-3 border-2 border-gray-300 rounded-md mb-2 w-full"
                        placeholder="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        className="bg-transparent focus:outline-none p-3 border-2 border-gray-300 rounded-md mt-4 mb-2 w-full"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="text-black"
                >
                    Đăng nhập
                </button>
            </form>
        </section>
    )
}
