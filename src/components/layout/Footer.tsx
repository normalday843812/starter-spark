import { Button } from "@/components/ui/button"
import { TechInput } from "@/components/ui/TechInput"
import { Github, Instagram, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-16 px-6 lg:px-20 font-mono text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="col-span-1 lg:col-span-2">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tighter">
            STARTER<span className="text-cyan-700">SPARK</span>
          </h3>
          <p className="text-slate-600 max-w-sm mb-6 leading-relaxed font-sans">
            Open-source robotics education.
            <br />
            Honolulu, HI.
          </p>
          <div className="flex gap-4">
             <Button variant="ghost" size="icon" aria-label="GitHub" className="text-slate-500 hover:text-cyan-700 hover:bg-slate-100"><Github className="w-4 h-4" /></Button>
             <Button variant="ghost" size="icon" aria-label="Twitter" className="text-slate-500 hover:text-cyan-700 hover:bg-slate-100"><Twitter className="w-4 h-4" /></Button>
             <Button variant="ghost" size="icon" aria-label="Instagram" className="text-slate-500 hover:text-cyan-700 hover:bg-slate-100"><Instagram className="w-4 h-4" /></Button>
          </div>
        </div>

        <div>
          <h4 className="text-cyan-700 mb-6 uppercase tracking-wider">Navigate</h4>
          <ul className="space-y-3 text-slate-600">
            <li><Link href="/shop" className="hover:text-slate-900 transition-colors decoration-slate-300 hover:underline underline-offset-4">Shop</Link></li>
            <li><Link href="/learn" className="hover:text-slate-900 transition-colors decoration-slate-300 hover:underline underline-offset-4">Learn</Link></li>
            <li><Link href="/community" className="hover:text-slate-900 transition-colors decoration-slate-300 hover:underline underline-offset-4">Community</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-cyan-700 mb-6 uppercase tracking-wider">Newsletter</h4>
          <div className="space-y-4">
            <div className="flex gap-0">
               <TechInput placeholder="EMAIL_ADDRESS" className="h-10 bg-white border-r-0 focus:ring-0" />
               <Button className="bg-cyan-700 hover:bg-cyan-600 text-white hover:text-white rounded-l-none border border-l-0 border-cyan-700">
                 SUBMIT
               </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200 flex justify-between text-slate-500">
        <p>StarterSpark Robotics</p>
        <p>Est. 2025</p>
      </div>
    </footer>
  )
}
