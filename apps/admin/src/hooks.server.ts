import type { Handle } from '@sveltejs/kit';
import { api } from '$lib/api/client';

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('access_token');

	if (accessToken) {
		try {
			// We can either decode the token locally if we share the secret,
			// or call the backend /me endpoint. 
			// Calling backend is safer for validation but slower.
			// For this implementation, we'll try to fetch user info from backend.
			const user = await api.auth.me({ 
				headers: { Cookie: `access_token=${accessToken}` } 
			});
			event.locals.user = user;
		} catch (e) {
			event.cookies.delete('access_token', { path: '/' });
			event.locals.user = undefined;
		}
	}

	const response = await resolve(event);
	return response;
};
