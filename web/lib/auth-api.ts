import api from "./api-client";
import {
	BaseResponse,
	LoginResponse,
	SignUpResponse,
	UserMeResponse,
} from "./types";

class AuthApi {
	static async login({
		email,
		password,
	}: {
		email: string;
		password: string;
	}): Promise<LoginResponse> {
		const res = await api.post("/auth/login", { email, password });
		return res.data;
	}

	static async register({
		email,
		password,
	}: {
		email: string;
		password: string;
	}): Promise<SignUpResponse> {
		const res = await api.post("/auth/signup", { email, password });
		return res.data;
	}

	static async me(): Promise<UserMeResponse> {
		const res = await api.get("/auth/me");
		return res.data;
	}
}

export default AuthApi;
