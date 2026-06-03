import React from "react";
import { ShoppingCart, HelpCircle, Gift, PhoneCall, Mail, MapPin } from "lucide-react";
import Link from "next/link";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const FacebookIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const GmailIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const socialLinks = [
  { icon: YoutubeIcon, href: "#" },
  { icon: GmailIcon, href: "mailto:support@agrinex.com" },
  { icon: FacebookIcon, href: "#" },
  { icon: InstagramIcon, href: "#" }
];

const Footer = () => {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] pt-20 pb-10 text-gray-500 transition-colors duration-500">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
        {/* Brand Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="https://res.cloudinary.com/dhpvb2emj/image/upload/q_auto/f_auto/v1778241361/logo.png" 
                  alt="Agrinex Logo" 
                  className="h-10 md:h-12 w-auto object-contain select-none transition-transform group-hover:scale-105"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-xl font-black tracking-tighter text-[#1b6b3e] uppercase">Agrinex</span>
                <p className="text-[6px] font-black text-gray-400 uppercase tracking-[0.4em] ml-0.5">Digital Platform</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed font-bold text-gray-400">
                Agrinex is India's leading Agriculture Digital Platform. We are a one-stop-shop for all your agricultural needs.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[var(--foreground)] font-black uppercase text-xs tracking-[0.2em]">Follow Us</h4>
            <div className="flex gap-4">
                {socialLinks.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={social.href} 
                      target={social.href === "#" ? undefined : "_blank"} 
                      rel="noopener noreferrer" 
                      onClick={(e) => {
                        if (social.href === "#") {
                          e.preventDefault();
                        }
                      }}
                      className="w-10 h-10 rounded-xl bg-[var(--background)] flex items-center justify-center hover:bg-[#1b6b3e] hover:text-white transition-all cursor-pointer shadow-sm border border-[var(--border)]"
                    >
                        <social.icon size={18} />
                    </a>
                ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-[var(--foreground)] font-black mb-8 uppercase text-xs tracking-[0.2em] border-b-2 border-[#1b6b3e] inline-block pb-1">Shop By Category</h4>
          <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-gray-500">
            {["Seeds", "Crop Protection", "Crop Nutrition", "Equipments", "Garden Store", "Animal Husbandry"].map(link => (
                <li key={link}><Link href="#" className="hover:text-[#1b6b3e] transition-colors">{link}</Link></li>
            ))}
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-[var(--foreground)] font-black mb-8 uppercase text-xs tracking-[0.2em] border-b-2 border-[#1b6b3e] inline-block pb-1">Information</h4>
          <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-gray-500">
            {["About Us", "Contact Us", "Return Policy", "Privacy Policy", "Terms of Service", "Blogs"].map(link => (
                <li key={link}><Link href="#" className="hover:text-[#1b6b3e] transition-colors">{link}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-[var(--foreground)] font-black mb-8 uppercase text-xs tracking-[0.2em] border-b-2 border-[#1b6b3e] inline-block pb-1">Get In Touch</h4>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="mt-1 text-[#1b6b3e]"><PhoneCall size={18} /></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-400">Missed Call To Order</span>
                    <span className="text-sm font-black text-[var(--foreground)]">1800-3000-2434</span>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="mt-1 text-[#1b6b3e]"><Mail size={18} /></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-400">Email Support</span>
                    <span className="text-sm font-black text-[var(--foreground)]">support@agrinex.com</span>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="mt-1 text-[#1b6b3e]"><MapPin size={18} /></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-400">Head Office</span>
                    <span className="text-sm font-black text-[var(--foreground)]">Pune, Maharashtra, India</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Links */}
      <div className="bg-[var(--background)] py-12 border-y border-[var(--border)] transition-colors duration-500">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
                { title: "Bio Pesticides", links: ["Bio Insecticides", "Bio Fungicides", "Bio Herbicides"] },
                { title: "Seeds", links: ["Vegetable Seeds", "Fruit Seeds", "Flower Seeds"] },
                { title: "Protection", links: ["Insecticides", "Fungicides", "Herbicides"] },
                { title: "Nutrition", links: ["Fertilizers", "Growth Promoters"] },
                { title: "Equipments", links: ["Sprayers", "Harvesting Machines"] },
                { title: "Support", links: ["Bulk Inquiries", "Agri Advisory"] },
            ].map(group => (
                <div key={group.title}>
                    <h5 className="text-[10px] font-black uppercase text-[var(--foreground)] mb-4 tracking-widest">{group.title}</h5>
                    <ul className="space-y-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                        {group.links.map(link => <li key={link}>{link}</li>)}
                    </ul>
                </div>
            ))}
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest pt-12 text-gray-400">
        <div>© 2026 Agrinex India. All rights reserved.</div>
        <div className="flex gap-6 items-center">
            <span className="text-[#1b6b3e]">Visa</span>
            <span className="text-[#1b6b3e]">Mastercard</span>
            <span className="text-[#1b6b3e]">UPI</span>
            <span className="text-[#1b6b3e]">Net Banking</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
