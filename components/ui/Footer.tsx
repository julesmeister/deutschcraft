'use client';

import Link from 'next/link';
import { brandConfig } from '@/lib/brand-config';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-piku-purple-dark flex items-center justify-center">
                <span className="text-white font-black text-xl">T</span>
              </div>
              <span className="font-black text-xl">{brandConfig.name}</span>
            </div>
            <p className="text-gray-400">
              A unique approach to learning German with AI and peer collaboration
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-gray-400 hover:text-white transition">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
              <li><Link href="/demo" className="text-gray-400 hover:text-white transition">Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>{brandConfig.legal.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
