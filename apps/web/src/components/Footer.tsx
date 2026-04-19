import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="bg-primary text-gray-400 py-12 border-t border-white/10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-white font-bold mb-4">Njiani Electricals</h3>
          <p className="text-sm">Kenya's leading marketplace for electrical products and accessories.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Contact</h4>
          <p className="text-sm">Nairobi, Kenya</p>
          <p className="text-sm">Email: orders@njiani.co.ke</p>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-center text-xs">
        &copy; 2024 Njiani Electricals Limited. All rights reserved.
      </div>
    </footer>
  );
}
