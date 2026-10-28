'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Download, Search, FileText, Trash2, Plus, Eye, CheckCircle2, X, Filter, BookOpen, Clock, FileDown, ExternalLink } from 'lucide-react';

export default function SlideManager({ user }) {
  const isTeacher = user?.role === 'teacher';
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewSlide, setPreviewSlide] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [notification, setNotification] = useState(null);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('DBMS');
  const [newFileType, setNewFileType] = useState('pdf');
  const [newDescription, setNewDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const subjects = ['All', 'DBMS', 'OOP', 'ADSA', 'OS', 'RANAC', 'CNA'];

  useEffect(() => {
    fetchSlides();
  }, [selectedSubject]);

  useEffect(() => {
    if (previewSlide) {
      if (previewSlide.fileUrl && previewSlide.fileUrl.startsWith('data:')) {
        try {
          const blob = dataURItoBlob(previewSlide.fileUrl);
          const url = URL.createObjectURL(blob);
          setPreviewBlobUrl(url);
          return () => URL.revokeObjectURL(url);
        } catch (e) {
          console.error('Failed to create blob for preview:', e);
          setPreviewBlobUrl(previewSlide.fileUrl);
        }
      } else {
        setPreviewBlobUrl(previewSlide.fileUrl);
      }
    } else {
      setPreviewBlobUrl(null);
    }
  }, [previewSlide]);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/slides?subject=${selectedSubject}`);
      const data = await res.json();
      if (data.slides) {
        setSlides(data.slides);
      }
    } catch (err) {
      console.error('Failed to fetch slides', err);
    } finally {
      setLoading(false);
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setUploading(true);
    try {
      let fileUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf";
      let fileSize = "3.5 MB";
      let fileType = "pdf";

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          fileUrl = uploadData.url;
          fileSize = uploadData.fileSize;
          fileType = uploadData.fileType;
        }
      }

      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          subject: newSubject,
          description: newDescription,
          teacherName: user?.name,
          fileType,
          fileSize,
          fileUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setSlides([data.slide, ...slides]);
        setShowUploadModal(false);
        setNewTitle('');
        setNewDescription('');
        setSelectedFile(null);
        showToast('Slide uploaded & published to IIIT Sri City portal!');
      }
    } catch (err) {
      console.error('Upload error', err);
      showToast('Error uploading slide.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this lecture slide?')) return;
    try {
      const res = await fetch(`/api/slides?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSlides(slides.filter(s => s.id !== id));
        showToast('Slide removed from portal.');
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  // Open PDF in New Browser Tab
  const handleOpenInNewTab = (slide) => {
    if (!slide.fileUrl) return;
    if (slide.fileUrl.startsWith('data:')) {
      try {
        const blob = dataURItoBlob(slide.fileUrl);
        const blobUrl = URL.createObjectURL(blob);
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.document.write(
            `<!DOCTYPE html><html><head><title>${slide.title}</title><style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style></head><body><iframe src="${blobUrl}"></iframe></body></html>`
          );
          newTab.document.close();
        } else {
          window.location.href = blobUrl;
        }
      } catch (e) {
        console.error('Error opening in new tab:', e);
      }
    } else {
      window.open(slide.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Native File Download Handler
  const handleDownload = (slide) => {
    const filename = `${slide.title.replace(/[^a-zA-Z0-9]/g, '_')}.${slide.fileType || 'pdf'}`;
    
    if (slide.fileUrl && slide.fileUrl.startsWith('data:')) {
      try {
        const blob = dataURItoBlob(slide.fileUrl);
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch (e) {
        console.error('Data URI download failed', e);
      }
    } else {
      const link = document.createElement('a');
      link.href = slide.fileUrl;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setSlides(slides.map(s => s.id === slide.id ? { ...s, downloads: s.downloads + 1 } : s));
    showToast(`Downloading: ${slide.title}`);
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredSlides = slides.filter(slide => {
    const matchesSearch = slide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          slide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-5">
      
      {/* Top Banner (Rich Header) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-800/40 rounded-xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-950/10 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Course Materials & Slides</h2>
            <p className="text-xs text-emerald-200/80 hidden sm:block font-medium">
              {isTeacher ? 'Upload and manage official course lecture notes' : 'Official lecture slide repository maintained by IIIT Sri City'}
            </p>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/15 backdrop-blur-md shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Upload Slide</span>
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl shadow-sm animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search slides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          <span className="text-sm font-semibold text-slate-500 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-4 h-4 text-emerald-600" /> Course:
          </span>
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                selectedSubject === subj
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Slide Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : filteredSlides.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No slides uploaded yet</h3>
          <p className="text-sm text-slate-500 mt-1">Professors can click upload to publish lecture notes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" key={selectedSubject + searchQuery}>
          {filteredSlides.map((slide, i) => (
            <div
              key={slide.id}
              className={`bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-sm card-hover group stagger-${(i % 9) + 1}`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase tracking-wide">
                    {slide.subject}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {slide.uploadDate}
                    </span>
                    {isTeacher && (
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                  {slide.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed font-normal">
                  {slide.description}
                </p>
              </div>

              {/* Meta & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{slide.uploadedBy}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{slide.fileSize} • {slide.downloads} DLs</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenInNewTab(slide)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-sm font-semibold transition-colors"
                    title="View PDF"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDownload(slide)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal (Teacher Only) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-5 shadow-xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Upload Slide</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Document File *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.pptx,.docx,.doc"
                  onChange={handleFileChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Lecture Title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Course *
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  >
                    {subjects.filter(s => s !== 'All').map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Format
                  </label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  >
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="pptx">PowerPoint (.pptx)</option>
                    <option value="docx">Word (.docx)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of contents..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-70"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
