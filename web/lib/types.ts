import { AxiosError } from "axios";

export interface User {
	id: string;
	email: string;
	created_at: string;
}

export interface Session {
	id: string;
	user_id: string;
	start_time: string;
	end_time: string;
	duration_seconds: number;
	final_transcript: string;
	word_count: number;
	language: string;
	model_used: string;
	created_at: string;
	updated_at: string;
}

export interface BaseResponse {
	message: string;
}

export interface SignUpResponseData {
	access_token: string;
	user: User;
}

export interface SignUpResponse extends BaseResponse {
	data: SignUpResponseData;
}

export interface LoginResponseData {
	access_token: string;
}

export interface LoginResponse extends BaseResponse {
	data: LoginResponseData;
}

export interface SessionResponse extends BaseResponse {
	data: Session[];
}

export interface SingleSessionResponse extends BaseResponse {
	data: Session;
}

// Auth Types
export interface UserSignup {
	email: string;
	password: string;
}

export interface UserLogin {
	email: string;
	password: string;
}

export interface UserMeResponse extends BaseResponse {
	data: User;
}

export interface ErrorData {
	detail: string;
}
export type ErrorRessponse = AxiosError<ErrorData>;
