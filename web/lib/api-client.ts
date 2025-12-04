"use client";

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		if (typeof window !== "undefined") {
			const token = window.localStorage.getItem("access_token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Clear auth on 401 and redirect to login
			if (typeof window !== "undefined") {
				window.localStorage.removeItem("access_token");
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

export default api;
