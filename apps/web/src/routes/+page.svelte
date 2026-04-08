<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/api/client';
	import { ShoppingCart, Zap, ShieldCheck, Truck } from 'lucide-svelte';
	import { cart } from '$lib/stores/cart.svelte';

	const featuredQuery = createQuery({
		queryKey: ['products', 'featured'],
		queryFn: () => api.products.featured(),
	});

	const categoriesQuery = createQuery({
		queryKey: ['categories'],
		queryFn: () => api.categories.list(),
	});
</script>

<svelte:head>
	<title>Njiani Electricals | Kenya's Premier Electrical Marketplace</title>
	<meta name="description" content="Shop high-quality chandeliers, solar lights, electrical cables and more at Njiani Electricals. Fast delivery across Kenya." />
</svelte:head>

<section class="relative bg-primary text-white py-24 overflow-hidden">
	<div class="absolute inset-0 opacity-10">
		<div class="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
		<div class="absolute bottom-0 right-0 w-96 h-96 bg-accent-alt rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
	</div>
	
	<div class="container mx-auto px-4 relative z-10 text-center">
		<h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Powering Your Space</h1>
		<p class="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">Discover premium electrical solutions for homes and businesses. Quality products, Kenyan reliability.</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a href="/products" class="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg shadow-accent/20">Shop Now</a>
			<a href="/categories" class="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all backdrop-blur-sm">Browse Categories</a>
		</div>
	</div>
</section>

<section class="py-16 bg-white">
	<div class="container mx-auto px-4">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
			<div class="flex flex-col items-center text-center p-6 rounded-xl bg-surface-2">
				<div class="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
					<Zap size={24} />
				</div>
				<h3 class="font-bold mb-2">Quality Products</h3>
				<p class="text-sm text-text-muted">Direct from trusted manufacturers and suppliers.</p>
			</div>
			<div class="flex flex-col items-center text-center p-6 rounded-xl bg-surface-2">
				<div class="w-12 h-12 bg-accent-alt/10 text-accent-alt rounded-full flex items-center justify-center mb-4">
					<ShieldCheck size={24} />
				</div>
				<h3 class="font-bold mb-2">Warranty Guaranteed</h3>
				<p class="text-sm text-text-muted">Peace of mind with our standard product warranties.</p>
			</div>
			<div class="flex flex-col items-center text-center p-6 rounded-xl bg-surface-2">
				<div class="w-12 h-12 bg-whatsapp/10 text-whatsapp rounded-full flex items-center justify-center mb-4">
					<ShoppingCart size={24} />
				</div>
				<h3 class="font-bold mb-2">Easy Ordering</h3>
				<p class="text-sm text-text-muted">Order via WhatsApp or Email in just a few clicks.</p>
			</div>
			<div class="flex flex-col items-center text-center p-6 rounded-xl bg-surface-2">
				<div class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
					<Truck size={24} />
				</div>
				<h3 class="font-bold mb-2">Fast Delivery</h3>
				<p class="text-sm text-text-muted">Prompt dispatch across Nairobi and all major towns.</p>
			</div>
		</div>
	</div>
</section>

<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="flex justify-between items-end mb-12">
			<div>
				<h2 class="text-3xl font-bold mb-2">Featured Products</h2>
				<p class="text-text-muted">Handpicked selection of our top-selling items.</p>
			</div>
			<a href="/products" class="text-accent font-bold hover:underline">View All</a>
		</div>

		{#if $featuredQuery.isLoading}
			<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
				{#each Array(4) as _}
					<div class="bg-white rounded-xl h-80 animate-pulse"></div>
				{/each}
			</div>
		{:else if $featuredQuery.error}
			<p class="text-red-500">Failed to load products.</p>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
				{#each $featuredQuery.data as product}
					<div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
						<a href="/products/{product.slug}" class="block aspect-square relative overflow-hidden bg-gray-100">
							<img src={product.imageUrls[0]} alt={product.name} class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
						</a>
						<div class="p-4">
							<p class="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">{product.category?.name}</p>
							<h3 class="font-bold mb-2 truncate">
								<a href="/products/{product.slug}" class="hover:text-accent transition-colors">{product.name}</a>
							</h3>
							<div class="flex justify-between items-center">
								<p class="font-bold text-lg">KES {(product.price / 100).toLocaleString()}</p>
								<button 
									onclick={() => cart.addItem(product)}
									class="bg-primary hover:bg-accent text-white p-2 rounded-lg transition-colors"
									aria-label="Add to cart"
								>
									<ShoppingCart size={18} />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<section class="py-20 bg-surface-2">
	<div class="container mx-auto px-4 text-center">
		<h2 class="text-3xl font-bold mb-12">Shop by Category</h2>
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
			{#if $categoriesQuery.data}
				{#each $categoriesQuery.data.slice(0, 12) as category}
					<a href="/products?category={category.slug}" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
						<h3 class="font-bold text-sm">{category.name}</h3>
					</a>
				{/each}
			{/if}
		</div>
	</div>
</section>
