<script lang="ts">
	import { page } from '$app/state';
	import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-svelte';
	
	const ref = $derived(page.url.searchParams.get('ref') || 'NJE-XXXX');
</script>

<div class="container mx-auto px-4 py-24 text-center">
	<div class="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
		<div class="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
			<CheckCircle2 size={48} />
		</div>
		
		<h1 class="text-4xl font-bold mb-4 tracking-tight text-primary">Order Placed Successfully!</h1>
		<p class="text-gray-500 mb-8 text-lg">Thank you for shopping with Njiani Electricals. Your order has been received and is being processed.</p>
		
		<div class="bg-surface-2 p-6 rounded-2xl mb-10 inline-block border border-gray-100">
			<p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Order Reference</p>
			<p class="text-2xl font-mono font-bold text-primary">{ref}</p>
		</div>
		
		<div class="space-y-4 max-w-sm mx-auto">
			<p class="text-sm text-gray-400">What's next? If you chose WhatsApp, we've opened a chat with our team. If you chose Email, check your inbox for confirmation. We will contact you soon for delivery details.</p>
			
			<div class="pt-8 flex flex-col gap-4">
				<a href="/products" class="bg-primary hover:bg-accent text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10">
					<ShoppingBag size={20} />
					Continue Shopping
				</a>
				<a href="/" class="text-gray-400 hover:text-primary font-bold flex items-center justify-center gap-2 transition-colors">
					Back to Home
					<ArrowRight size={18} />
				</a>
			</div>
		</div>
	</div>
</div>
