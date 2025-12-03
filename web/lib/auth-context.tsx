"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import type { User } from "./types";
import { getApiClient, setAuthToken } from "./api-client";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (email: string, password: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		const userData = localStorage.getItem("user");

		if (token && userData) {
			setAuthToken(token);
			setUser(JSON.parse(userData));
		}

		setIsLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		const client = getApiClient();
		const response = await client.post("/auth/login", { email, password });
		const { access_token } = response.data.data;

		localStorage.setItem("access_token", access_token);
		setAuthToken(access_token);

		const userResponse = await client.get("/auth/me");
		const userData = userResponse.data.data;

		localStorage.setItem("user", JSON.stringify(userData));
		setUser(userData);
	};

	const signup = async (email: string, password: string) => {
		const client = getApiClient();
		const response = await client.post("/auth/signup", { email, password });
		const { access_token, user: userData } = response.data.data;

		localStorage.setItem("access_token", access_token);
		localStorage.setItem("user", JSON.stringify(userData));
		setAuthToken(access_token);
		setUser(userData);
	};

	const logout = () => {
		localStorage.removeItem("access_token");
		localStorage.removeItem("user");
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isAuthenticated: !!user,
				login,
				signup,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
