import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck, Database } from 'lucide-react';

interface FooterProps {
  setActiveTab?: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-[#18181b] text-stone-300 border-t border-stone-800 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="flex items-center space-x-3 text-inherit no-underline">
              <div className="w-8 h-8 rounded-xs bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-lg shadow-xs">
                स
              </div>
              <span className="font-serif text-2xl font-black tracking-tight text-white">
                SATYAKSH
              </span>
            </Link>

            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              <strong>SATYAKSH</strong> is an independent public accountability intelligence platform tracking the lifecycle of Member of Parliament Local Area Development Scheme (MPLADS) public funds across India.
            </p>

            <div className="pt-2 text-[11px] text-stone-500 font-mono">
              Tagline: <em>"See Where Public Money Goes."</em>
            </div>
          </div>

          {/* Quick Platform Navigation */}
          <div className="space-y-2.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber-400 font-bold">
              Platform Modules
            </div>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors no-underline text-stone-400">
                  National Overview
                </Link>
              </li>
              <li>
                <Link to="/risk-intelligence" className="hover:text-white transition-colors text-amber-300/90 font-medium no-underline">
                  Risk Intelligence Dashboard
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors no-underline text-stone-400">
                  Where Money Went (Works Register)
                </Link>
              </li>
              <li>
                <Link to="/geospatial-tracker" className="hover:text-white transition-colors no-underline text-stone-400">
                  Geospatial Project Tracker
                </Link>
              </li>
              <li>
                <Link to="/spatial-screening" className="hover:text-white transition-colors no-underline text-stone-400">
                  Spatial Duplicate Screening
                </Link>
              </li>
              <li>
                <Link to="/money-flow" className="hover:text-white transition-colors no-underline text-stone-400">
                  Statutory Money Flow
                </Link>
              </li>
              <li>
                <Link to="/states" className="hover:text-white transition-colors no-underline text-stone-400">
                  India by State & Territory
                </Link>
              </li>
              <li>
                <Link to="/compare-mps" className="hover:text-white transition-colors no-underline text-stone-400">
                  Compare Members of Parliament
                </Link>
              </li>
              <li>
                <Link to="/signals" className="hover:text-white transition-colors no-underline text-stone-400">
                  Transparency Signals (Anomalies)
                </Link>
              </li>
            </ul>
          </div>

          {/* Accountability & Public Action */}
          <div className="space-y-2.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber-400 font-bold">
              Action & Governance
            </div>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <Link to="/investigations" className="hover:text-white transition-colors no-underline text-stone-400">
                  Investigations Case Files
                </Link>
              </li>
              <li>
                <Link to="/evidence-vault" className="hover:text-white transition-colors no-underline text-stone-400">
                  Evidence Vault & Geotags
                </Link>
              </li>
              <li>
                <Link to="/grievances" className="hover:text-white transition-colors no-underline text-stone-400">
                  Citizen Grievance Portal
                </Link>
              </li>
              <li>
                <Link to="/data-health" className="hover:text-white transition-colors no-underline text-stone-400">
                  Data Provenance & Quality
                </Link>
              </li>
              <li>
                <Link to="/data-sources" className="hover:text-white transition-colors no-underline text-stone-400">
                  Official Data Sources
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-white transition-colors no-underline text-stone-400">
                  Project Monitoring & Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Government Data Sources */}
          <div className="space-y-2.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber-400 font-bold">
              Official Data Sources
            </div>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <a href="https://mplads.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 text-inherit no-underline">
                  <span>MoSPI MPLADS Portal</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a href="https://data.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 text-inherit no-underline">
                  <span>Open Government Data (OGD)</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a href="https://pfms.nic.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 text-inherit no-underline">
                  <span>PFMS Single Nodal Escrow</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a href="https://cag.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 text-inherit no-underline">
                  <span>Comptroller & Auditor General</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 font-mono gap-3">
          <span>Official 18th Lok Sabha & Rajya Sabha Public Money Explorer</span>
          <span>Zero Fabricated Data • Audited Public Records</span>
        </div>
      </div>
    </footer>
  );
};
