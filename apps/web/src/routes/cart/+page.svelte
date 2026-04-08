<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { api } from '$lib/api/client';
	import { ShoppingCart, Trash2, ArrowLeft, MessageCircle, Mail, Loader2 } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let customerName = $state('');
	let customerPhone = $state('');
	let customerEmail = $state('');
	let customerLocation = $state('');
	let notes = $state('');
	let isSubmitting = $state(false);
	let error = $state('');

	async function submitOrder(channel: 'WHATSAPP' | 'EMAIL') {
		if (!customerName || !customerPhone) {
			error = 'Name and Phone are required';
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			const orderData = {
				customerName,
				customerPhone,
				customerEmail: customerEmail || undefined,
				customerLocation: customerLocation || undefined,
				notes: notes || undefined,
				channel,
				items: cart.items.map(i => ({
					productId: i.product.id,
					quantity: i.quantity
				}))
			};

			const order = await api.orders.create(orderData);

			if (channel === 'WHATSAPP') {
				const itemList = cart.items
					.map(i => `• ${i.product.name} (x${i.quantity})`)
					.join('\n');
				const message = encodeURIComponent(
					`Hello Njiani Electricals, I'd like to place an order:\n\n${itemList}\n\n` +
					`Total: KES ${(cart.totalAmount / 100).toLocaleString()}\n` +
					`Reference: ${order.referenceNumber}\n\n` +
					`My name: ${customerName}\n\nPlease confirm availability. Thank you.`
				);
				window.open(`https://wa.me/254700000000?text=${message}`, '_blank');
			}

			cart.clear();
			goto('/order/success?ref=' + order.referenceNumber);
		} catch (err: any) {
			error = err.message || 'Failed to place order. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-12">
	<div class="flex items-center gap-4 mb-12">
		<a href="/products" class="bg-white p-2 rounded-lg shadow-sm hover:text-accent transition-colors">
			<ArrowLeft size={20} />
		</a>
		<h1 class="text-3xl font-bold">Your Shopping Cart</h1>
	</div>

	{#if cart.items.length === 0}
		<div class="bg-white rounded-2xl p-16 text-center shadow-sm max-w-2xl mx-auto">
			<div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
				<ShoppingCart size={40} />
			</div>
			<h2 class="text-2xl font-bold mb-4">Your cart is empty</h2>
			<p class="text-gray-500 mb-8">Looks like you haven't added any electrical products yet.</p>
			<a href="/products" class="bg-primary hover:bg-accent text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/10 inline-block">
				Browse Products
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
			<!-- Cart Items -->
			<div class="lg:col-span-2 space-y-4">
				{#each cart.items as item (item.product.id)}
					<div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-center">
						<div class="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
							<img src={item.product.imageUrls[0]} alt={item.product.name} class="w-full h-full object-cover" />
						</div>
						<div class="flex-grow min-w-0">
							<h3 class="font-bold text-lg truncate mb-1">{item.product.name}</h3>
							<p class="text-xs text-gray-400 mb-3">{item.product.category?.name}</p>
							<div class="flex items-center justify-between">
								<p class="font-bold text-accent">KES {(item.product.price / 100).toLocaleString()}</p>
								<div class="flex items-center gap-4">
									<div class="flex items-center border border-gray-200 rounded-lg overflow-hidden h-10">
										<button 
											onclick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
											class="px-3 hover:bg-gray-100 transition-colors"
										>-</button>
										<span class="w-10 text-center font-bold text-sm">{item.quantity}</span>
										<button 
											onclick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
											class="px-3 hover:bg-gray-100 transition-colors"
										>+</button>
									</div>
									<button 
										onclick={() => cart.removeItem(item.product.id)}
										class="text-gray-300 hover:text-red-500 transition-colors p-2"
									>
										<Trash2 size={18} />
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Checkout Form -->
			<aside class="w-full">
				<div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
					<h2 class="text-xl font-bold mb-6">Order Details</h2>
					
					<div class="space-y-4 mb-8">
						<div>
							<label for="name" class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name *</label>
							<input type="text" id="name" bind:value={customerName} placeholder="Enter your name" class="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all" />
						</div>
						<div>
							<label for="phone" class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number *</label>
							<input type="tel" id="phone" bind:value={customerPhone} placeholder="e.g. 0700 000 000" class="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all" />
						</div>
						<div>
							<label for="email" class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email (Optional)</label>
							<input type="email" id="email" bind:value={customerEmail} placeholder="your@email.com" class="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all" />
						</div>
						<div>
							<label for="location" class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Delivery Location (Optional)</label>
							<input type="text" id="location" bind:value={customerLocation} placeholder="e.g. Westlands, Nairobi" class="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all" />
						</div>
						<div>
							<label for="notes" class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Notes</label>
							<textarea id="notes" bind:value={notes} rows="2" placeholder="Any specific instructions?" class="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all"></textarea>
						</div>
					</div>

					<div class="border-t border-gray-100 pt-6 mb-8">
						<div class="flex justify-between items-center mb-2">
							<span class="text-gray-500">Subtotal</span>
							<span class="font-medium text-gray-700">KES {(cart.totalAmount / 100).toLocaleString()}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-xl font-bold">Total</span>
							<span class="text-xl font-bold text-primary">KES {(cart.totalAmount / 100).toLocaleString()}</span>
						</div>
					</div>

					{#if error}
						<div class="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
							<span class="font-bold">Error:</span> {error}
						</div>
					{/if}

					<div class="flex flex-col gap-3">
						<button 
							onclick={() => submitOrder('WHATSAPP')}
							disabled={isSubmitting}
							class="w-full bg-whatsapp hover:bg-whatsapp/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-whatsapp/10 disabled:opacity-50"
						>
							{#if isSubmitting}
								<Loader2 class="animate-spin" size={20} />
							{:else}
								<MessageCircle size={20} />
							{/if}
							Order via WhatsApp
						</button>
						<button 
							onclick={() => submitOrder('EMAIL')}
							disabled={isSubmitting}
							class="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
						>
							{#if isSubmitting}
								<Loader2 class="animate-spin" size={20} />
							{:else}
								<Mail size={20} />
							{/if}
							Order via Email
						</button>
					</div>
					<p class="text-[10px] text-gray-400 text-center mt-4">
						By placing an order, you agree to our Terms & Conditions.
					</p>
				</div>
			</aside>
		</div>
	{/if}
</div>
