import api from "./api-client";
import { BaseResponse, SessionResponse, SingleSessionResponse } from "./types";

class SessionsApi {
	static async getSessions(): Promise<SessionResponse> {
		const res = await api.get("/sessions");
		return res.data;
	}

	static async getSessionById(id: string): Promise<SingleSessionResponse> {
		const res = await api.get(`/sessions/${id}`);
		return res.data;
	}

	static async deleteSession(id: string): Promise<BaseResponse> {
		const res = await api.delete(`/sessions/${id}`);
		return res.data;
	}
}

export default SessionsApi;
