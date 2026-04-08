<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/api/client';
	import { page } from '$app/state';
	import { ShoppingCart, MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-svelte';
	import { cart } from '$lib/stores/cart.svelte';

	const slug = $derived(page.params.slug);
	const productQuery = $derived(createQuery({
		queryKey: ['products', slug],
		queryFn: () => api.products.bySlug(slug),
	}));

	let quantity = $state(1);
	let activeImage = $state(0);

	function buildWhatsAppUrl(product: any) {
		const message = encodeURIComponent(
			`Hello Njiani Electricals, I'm interested in:\n\n` +
			`*${product.name}*\n` +
			`Price: KES ${(product.price / 100).toLocaleString()}\n` +
			`Quantity: ${quantity}\n\n` +
			`Please confirm availability. Thank you!`
		);
		return `https://wa.me/254700000000?text=${message}`;
	}
</script>

{#if $productQuery.isLoading}
	<div class="container mx-auto px-4 py-12 animate-pulse">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-12">
			<div class="bg-white rounded-2xl aspect-square"></div>
			<div class="space-y-6">
				<div class="h-8 bg-white rounded w-3/4"></div>
				<div class="h-4 bg-white rounded w-1/4"></div>
				<div class="h-32 bg-white rounded"></div>
			</div>
		</div>
	</div>
{:else if $productQuery.data}
	{@const product = $productQuery.data}
	<svelte:head>
		<title>{product.metaTitle || product.name} | Njiani Electricals</title>
		<meta name="description" content={product.metaDescription || product.description.slice(0, 160)} />
	</svelte:head>

	<div class="container mx-auto px-4 py-8">
		<!-- Breadcrumbs -->
		<nav class="flex items-center gap-2 text-sm text-gray-400 mb-8">
			<a href="/" class="hover:text-accent">Home</a>
			<ChevronRight size={14} />
			<a href="/products" class="hover:text-accent">Products</a>
			<ChevronRight size={14} />
			<span class="text-gray-600 truncate">{product.name}</span>
		</nav>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
			<!-- Image Gallery -->
			<div class="space-y-4">
				<div class="bg-white rounded-2xl overflow-hidden shadow-sm aspect-square border border-gray-100">
					<img src={product.imageUrls[activeImage]} alt={product.name} class="w-full h-full object-cover" />
				</div>
				{#if product.imageUrls.length > 1}
					<div class="flex gap-4 overflow-x-auto pb-2">
						{#each product.imageUrls as img, i}
							<button 
								onclick={() => activeImage = i}
								class="w-20 h-20 rounded-lg overflow-hidden border-2 transition-all {activeImage === i ? 'border-accent shadow-md' : 'border-transparent opacity-60'}"
							>
								<img src={img} alt="" class="w-full h-full object-cover" />
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Product Info -->
			<div class="flex flex-col">
				<div class="mb-2 flex items-center gap-3">
					<span class="bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
						{product.category?.name}
					</span>
					{#if product.status === 'ACTIVE'}
						<span class="flex items-center gap-1 text-green-600 text-xs font-medium">
							<CheckCircle2 size={14} /> In Stock
						</span>
					{/if}
				</div>

				<h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">{product.name}</h1>
				<p class="text-sm text-gray-400 mb-6">SKU: {product.sku}</p>

				<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
					<p class="text-4xl font-bold text-primary mb-6">
						<span class="text-lg font-medium text-gray-400 mr-1 text-sm uppercase tracking-tighter">KES</span>
						{(product.price / 100).toLocaleString()}
					</p>

					<div class="flex items-center gap-4 mb-6">
						<div class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
							<button 
								onclick={() => quantity = Math.max(1, quantity - 1)}
								class="px-4 py-2 hover:bg-gray-200 transition-colors"
							>-</button>
							<span class="w-12 text-center font-bold">{quantity}</span>
							<button 
								onclick={() => quantity++}
								class="px-4 py-2 hover:bg-gray-200 transition-colors"
							>+</button>
						</div>
						<p class="text-xs text-gray-400 font-medium">Available: {product.stockQuantity} units</p>
					</div>

					<div class="flex flex-col sm:flex-row gap-4">
						<button 
							onclick={() => cart.addItem(product, quantity)}
							disabled={product.status !== 'ACTIVE'}
							class="flex-grow bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10"
						>
							<ShoppingCart size={20} />
							Add to Cart
						</button>
						<a 
							href={buildWhatsAppUrl(product)}
							target="_blank"
							class="flex-grow bg-whatsapp hover:bg-whatsapp/90 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-whatsapp/10"
						>
							<MessageCircle size={20} />
							Order on WhatsApp
						</a>
					</div>
				</div>

				<div class="prose prose-sm max-w-none text-gray-600 border-t border-gray-100 pt-8">
					<h3 class="text-primary font-bold text-lg mb-4">Description</h3>
					<div class="whitespace-pre-line leading-relaxed">
						{product.description}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
