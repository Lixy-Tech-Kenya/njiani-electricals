<script lang="ts">
	import './layout.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import { cart } from '$lib/stores/cart.svelte';
	
	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: 60 * 1000,
			},
		},
	});
</script>

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen flex flex-col">
		<header class="sticky top-0 z-50 bg-primary text-white shadow-md">
			<nav class="container mx-auto px-4 py-4 flex justify-between items-center">
				<a href="/" class="text-2xl font-bold tracking-tight">Njiani Electricals</a>
				<div class="flex items-center gap-6">
					<a href="/products" class="hover:text-accent transition-colors">Products</a>
					<a href="/cart" class="relative group">
						<span>Cart</span>
						{#if cart.itemCount > 0}
							<span class="absolute -top-2 -right-3 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border border-primary">
								{cart.itemCount}
							</span>
						{/if}
					</a>
				</div>
			</nav>
		</header>

		<main class="flex-grow">
			{@render children()}
		</main>

		<footer class="bg-primary text-gray-400 py-12 border-t border-white/10">
			<div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
				<div>
					<h3 class="text-white font-bold mb-4">Njiani Electricals</h3>
					<p class="text-sm">Kenya's leading marketplace for electrical products and accessories.</p>
				</div>
				<div>
					<h4 class="text-white font-bold mb-4">Quick Links</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="/products" class="hover:text-white transition-colors">All Products</a></li>
						<li><a href="/categories" class="hover:text-white transition-colors">Categories</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-white font-bold mb-4">Contact</h4>
					<p class="text-sm">Nairobi, Kenya</p>
					<p class="text-sm">Email: orders@njiani.co.ke</p>
				</div>
			</div>
			<div class="container mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-center text-xs">
				&copy; 2024 Njiani Electricals Limited. All rights reserved.
			</div>
		</footer>
	</div>
</QueryClientProvider>
