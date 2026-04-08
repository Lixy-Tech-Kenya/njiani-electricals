<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/api/client';
	import { page } from '$app/state';
	import { Search, SlidersHorizontal, ShoppingCart } from 'lucide-svelte';
	import { cart } from '$lib/stores/cart.svelte';

	let searchTerm = $state(page.url.searchParams.get('search') || '');
	let category = $derived(page.url.searchParams.get('category') || '');
	let sort = $state(page.url.searchParams.get('sort') || 'newest');

	const productsQuery = $derived(createQuery({
		queryKey: ['products', { category, search: searchTerm, sort }],
		queryFn: () => api.products.list({ 
			category: category || undefined, 
			search: searchTerm || undefined, 
			sort: sort || undefined 
		}),
	}));

	const categoriesQuery = createQuery({
		queryKey: ['categories'],
		queryFn: () => api.categories.list(),
	});
</script>

<div class="container mx-auto px-4 py-12">
	<div class="flex flex-col md:flex-row gap-8">
		<!-- Filters Sidebar -->
		<aside class="w-full md:w-64 flex-shrink-0">
			<div class="bg-white p-6 rounded-xl shadow-sm sticky top-24">
				<h2 class="font-bold text-lg mb-6 flex items-center gap-2">
					<SlidersHorizontal size={20} />
					Filters
				</h2>

				<div class="mb-8">
					<h3 class="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Categories</h3>
					<div class="flex flex-col gap-2">
						<a href="/products" class="text-sm hover:text-accent transition-colors {category === '' ? 'font-bold text-accent' : ''}">
							All Categories
						</a>
						{#if $categoriesQuery.data}
							{#each $categoriesQuery.data as cat}
								<a href="/products?category={cat.slug}" class="text-sm hover:text-accent transition-colors {category === cat.slug ? 'font-bold text-accent' : ''}">
									{cat.name}
								</a>
							{/each}
						{/if}
					</div>
				</div>

				<div>
					<h3 class="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Sort By</h3>
					<select bind:value={sort} class="w-full p-2 rounded-lg border border-gray-200 text-sm bg-white">
						<option value="newest">Newest</option>
						<option value="price_asc">Price: Low to High</option>
						<option value="price_desc">Price: High to Low</option>
						<option value="name_asc">Name: A-Z</option>
					</select>
				</div>
			</div>
		</aside>

		<!-- Product Grid -->
		<div class="flex-grow">
			<div class="relative mb-8">
				<Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
				<input 
					type="text" 
					placeholder="Search products, SKUs, or keywords..." 
					bind:value={searchTerm}
					class="w-full pl-12 pr-4 py-4 rounded-xl border border-transparent bg-white shadow-sm focus:border-accent focus:ring-0 transition-all outline-none"
				/>
			</div>

			{#if $productsQuery.isLoading}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each Array(6) as _}
						<div class="bg-white rounded-xl h-96 animate-pulse"></div>
					{/each}
				</div>
			{:else if $productsQuery.data?.data.length === 0}
				<div class="bg-white rounded-xl p-12 text-center shadow-sm">
					<p class="text-gray-500 mb-4">No products found matching your criteria.</p>
					<a href="/products" class="text-accent font-bold hover:underline">Clear all filters</a>
				</div>
			{:else if $productsQuery.data}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each $productsQuery.data.data as product}
						<div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100">
							<a href="/products/{product.slug}" class="block aspect-square relative overflow-hidden bg-gray-50">
								<img src={product.imageUrls[0]} alt={product.name} class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
								{#if product.status === 'OUT_OF_STOCK'}
									<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
										<span class="bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Out of Stock</span>
									</div>
								{/if}
							</a>
							<div class="p-5">
								<p class="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">{product.category?.name}</p>
								<h3 class="font-bold mb-3 line-clamp-2 h-12 leading-snug">
									<a href="/products/{product.slug}" class="hover:text-accent transition-colors">{product.name}</a>
								</h3>
								<div class="flex justify-between items-center">
									<p class="font-bold text-xl">KES {(product.price / 100).toLocaleString()}</p>
									<button 
										onclick={() => cart.addItem(product)}
										disabled={product.status === 'OUT_OF_STOCK'}
										class="bg-primary hover:bg-accent disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors shadow-lg shadow-primary/10"
										aria-label="Add to cart"
									>
										<ShoppingCart size={20} />
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
