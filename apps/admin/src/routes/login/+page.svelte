<script lang="ts">
	import { api } from '$lib/api/client';
	import { goto } from '$app/navigation';
	import { Loader2, Lock, Mail } from 'lucide-svelte';

	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let error = $state('');

	async function handleLogin(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		error = '';

		try {
			await api.auth.login({ email, password });
			goto('/');
		} catch (err: unknown) {
			error = (err as Error).message || 'Login failed. Please check your credentials.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<div class="text-center mb-10">
			<h1 class="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Njiani Admin</h1>
			<p class="text-gray-500">Sign in to manage your marketplace</p>
		</div>

		<div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
			<form onsubmit={handleLogin} class="space-y-6">
				<div>
					<label for="email" class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
						<input 
							type="email" 
							id="email" 
							bind:value={email} 
							required
							placeholder="admin@njiani.co.ke"
							class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all" 
						/>
					</div>
				</div>

				<div>
					<label for="password" class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
						<input 
							type="password" 
							id="password" 
							bind:value={password} 
							required
							placeholder="••••••••"
							class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all" 
						/>
					</div>
				</div>

				{#if error}
					<div class="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium">
						{error}
					</div>
				{/if}

				<button 
					type="submit"
					disabled={isSubmitting}
					class="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
				>
					{#if isSubmitting}
						<Loader2 class="animate-spin" size={20} />
					{/if}
					Sign In
				</button>
			</form>
		</div>
		
		<p class="text-center mt-8 text-sm text-gray-400">
			&copy; 2024 Njiani Electricals Limited
		</p>
	</div>
</div>
