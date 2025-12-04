import "@tanstack/react-query";
import { ErrorRessponse } from "./types";

declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ErrorRessponse;
	}
}
