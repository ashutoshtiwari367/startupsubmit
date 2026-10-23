// components/layout/Footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070709] text-slate-400 text-xs mt-20 relative">
      
      {/* Soft Glow Effect at Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-orange-500/20">
                🇮🇳
              </div>
              <span className="font-extrabold text-white text-base">
                Vinay<span className="text-orange-500"> Startup</span>
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The premier product launchpad built for Indian founders & SaaS creators. Get early users, high DR dofollow backlinks, and machine-readable AI search visibility.
            </p>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/directory?category=saas" className="hover:text-orange-400 transition-colors">Indian SaaS Tools</Link></li>
              <li><Link href="/directory?category=ai" className="hover:text-orange-400 transition-colors">AI & Machine Learning</Link></li>
              <li><Link href="/directory?category=devtools" className="hover:text-orange-400 transition-colors">Developer Tools</Link></li>
              <li><Link href="/directory?category=fintech" className="hover:text-orange-400 transition-colors">Fintech & Payments</Link></li>
              <li><Link href="/directory?category=marketing" className="hover:text-orange-400 transition-colors">Marketing & SEO</Link></li>
            </ul>
          </div>

          {/* Column 3: AI & SEO Engine */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">
              AI & SEO Engine
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/llms.txt" target="_blank" className="text-orange-400 font-semibold hover:underline transition-all">
                  llms.txt (Machine Readable) ↗
                </Link>
              </li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Get Dofollow Backlink</Link></li>
              <li><Link href="/badge" className="hover:text-white transition-colors">Embed Badge</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">100+ Directory Submissions</Link></li>
            </ul>
          </div>

          {/* Column 4: Founders CTA Box */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">
              For Indian Founders
            </h4>
            <div className="bg-[#0f0f14] p-4 rounded-2xl border border-white/10 space-y-2.5">
              <span className="font-bold text-white block text-xs">🚀 Launch Your Tool</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                List your startup for free, embed our badge, and gain instant dofollow backlinks + permanent AI indexing.
              </p>
              <Link 
                href="/submit" 
                className="inline-block text-[11px] font-bold text-orange-400 hover:text-orange-300 hover:underline"
              >
                Submit Startup Now →
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
          <p>© {new Date().getFullYear()} Vinay Indian Startup Platform. Built for Indian Builders.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}