'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Layers,
  BookMarked,
  FileText,
  Clock,
  Sparkles,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck,
  Globe
} from 'lucide-react';

export default function Library({ user }) {
  const [viewMode, setViewMode] = useState('native'); // 'native' | 'iframe'
  const [activeModule, setActiveModule] = useState('search'); // 'search' | 'browse' | 'journals' | 'newaddition' | 'isbn' | 'accession'

  // Search Form State
  const [searchData, setSearchData] = useState('');
  const [db, setDb] = useState('1'); // Books etc
  const [qcon1, setQcon1] = useState('1'); // AND
  const [cat1, setCat1] = useState('0'); // Any Field
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [sortBy, setSortBy] = useState('Title');

  const handleReset = () => {
    setSearchData('');
    setDb('1');
    setQcon1('1');
    setCat1('0');
    setFromYear('');
    setToYear('');
    setSortBy('Title');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Build direct OPAC search redirection URL
    const opacBaseUrl = 'https://iiitsopac.lsease.in/search/searchResult.html';
    const params = new URLSearchParams({
      searchdata: searchData,
      db: db,
      qcon1: qcon1,
      cat1: cat1,
      fromTF1: fromYear,
      toTF1: toYear,
      sortByVal: sortBy,
      guest: 'true'
    });
    window.open(`${opacBaseUrl}?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const getModuleUrl = (mod) => {
    switch (mod) {
      case 'browse':
        return 'https://iiitsopac.lsease.in/browse/browse.html?guest=true';
      case 'journals':
        return 'https://iiitsopac.lsease.in/journals/journals.html?guest=true';
      case 'newaddition':
        return 'https://iiitsopac.lsease.in/newaddition/newAddition.html?guest=true';
      case 'isbn':
        return 'https://iiitsopac.lsease.in/isbnNo/isbn.html?guest=true';
      case 'accession':
        return 'https://iiitsopac.lsease.in/accessionNo/accession.html?guest=true';
      default:
        return 'https://iiitsopac.lsease.in/search/search.html?guest=true';
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner (Rich Header) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-800/40 rounded-xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-950/10 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Library OPAC Catalog</h2>
            <p className="text-xs text-emerald-200/80 hidden sm:block font-medium">Physical books, journals, and digital academic resources</p>
          </div>
        </div>

        <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/15 shrink-0">
          <button
            onClick={() => setViewMode('native')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
              viewMode === 'native'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Native Search</span>
          </button>
          <button
            onClick={() => setViewMode('iframe')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
              viewMode === 'iframe'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Web Portal</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { id: 'search', label: 'Search', icon: Search, desc: 'Keywords' },
          { id: 'browse', label: 'Browse', icon: Layers, desc: 'Categories' },
          { id: 'journals', label: 'Journals', icon: BookMarked, desc: 'Serials' },
          { id: 'newaddition', label: 'New', icon: Sparkles, desc: 'Arrivals' },
          { id: 'isbn', label: 'ISBN', icon: FileText, desc: 'By Book No.' },
          { id: 'accession', label: 'Accession', icon: BookmarkCheck, desc: 'Records' },
        ].map((item, i) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between card-hover stagger-${(i % 9) + 1} ${
                isActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-lg w-fit transition-transform duration-200 ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <div className="font-bold text-sm">{item.label}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {viewMode === 'native' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Catalog Search</span>
            </h3>
            <a
              href="https://iiitsopac.lsease.in/search/search.html?guest=true"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <span>Open Full Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Primary Keyword Input */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 block">
                Search Terms
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchData}
                  onChange={(e) => setSearchData(e.target.value)}
                  placeholder="Enter title, author, keyword..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Database</label>
                <select
                  value={db}
                  onChange={(e) => setDb(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                >
                  <option value="1">Books etc</option>
                  <option value="2">Journals & Serials</option>
                  <option value="3">Digital Archives</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Operator</label>
                <select
                  value={qcon1}
                  onChange={(e) => setQcon1(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                >
                  <option value="1">AND (All)</option>
                  <option value="0">OR (Any)</option>
                  <option value="2">Exact Phrase</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Search In</label>
                <select
                  value={cat1}
                  onChange={(e) => setCat1(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                >
                  <option value="0">Any Field</option>
                  <option value="1">Author</option>
                  <option value="2">Title</option>
                  <option value="3">Series</option>
                  <option value="4">Place</option>
                  <option value="5">Publisher</option>
                  <option value="6">Subject</option>
                  <option value="7">ISBN</option>
                  <option value="Z">Accession No.</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Year (From)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                  placeholder="YYYY"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Year (To)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value)}
                  placeholder="YYYY"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                >
                  <option value="Title">Title</option>
                  <option value="Author">Author</option>
                  <option value="Popularity">Popularity</option>
                  <option value="Publ. Year(desc.)">Year (Newest)</option>
                  <option value="Publ. Year(asc.)">Year (Oldest)</option>
                  <option value="Classified">Classified</option>
                </select>
              </div>

            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search OPAC</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Embedded Live Iframe View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in flex flex-col h-[700px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-2 font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Library Portal</span>
            </div>
            <a
              href={getModuleUrl(activeModule)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold hover:text-emerald-800 flex items-center space-x-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Open in new tab</span>
            </a>
          </div>
          <iframe
            src={getModuleUrl(activeModule)}
            title="IIITS OPAC Portal"
            className="w-full flex-1 border-none bg-white"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      )}

      {/* Footer Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-700 shadow-sm">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Need Library Assistance?</div>
            <div className="text-slate-600 font-medium">Visit the Library Resource Center on Campus.</div>
          </div>
        </div>
        <a
          href="https://iiitsopac.lsease.in/search/search.html?guest=true"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
        >
          Guest Portal Access
        </a>
      </div>

    </div>
  );
}
