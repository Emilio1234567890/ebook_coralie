"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function PdfBookReader({ pdfUrl, setErr }) {
  const wrapRef = useRef(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(920);

  useEffect(() => {
    function updateWidth() {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth;

      if (w < 640) setPageWidth(Math.max(260, w - 24));
      else if (w < 1024) setPageWidth(w - 40);
      else setPageWidth(Math.min(920, w - 80));
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function nextPage() {
    setCurrentPage((p) => clamp(p + 1, 1, numPages));
  }

  function prevPage() {
    setCurrentPage((p) => clamp(p - 1, 1, numPages));
  }

  function onDragEnd(_, info) {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -90 || velocity < -500) {
      nextPage();
      return;
    }

    if (offset > 90 || velocity > 500) {
      prevPage();
    }
  }

  const progress = useMemo(() => {
    if (!numPages) return 0;
    return Math.round((currentPage / numPages) * 100);
  }, [currentPage, numPages]);

  return (
    <div className="reader-stage" ref={wrapRef}>
      {numPages > 0 ? (
        <div className="reader-meta reader-meta--inline">
          <div className="reader-meta-pill">
            Page {currentPage} / {numPages}
          </div>
          <div className="reader-meta-pill">{progress}% lu</div>
        </div>
      ) : null}

      <div className="reader-controls">
        <button
          type="button"
          className="reader-nav-btn"
          onClick={prevPage}
          disabled={currentPage <= 1}
        >
          ← Page précédente
        </button>

        <div className="reader-progress">
          <div
            className="reader-progress__bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          className="reader-nav-btn"
          onClick={nextPage}
          disabled={currentPage >= numPages}
        >
          Page suivante →
        </button>
      </div>

      <div className="reader-hint">
        Glisse horizontalement ou utilise les boutons pour tourner les pages.
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="reader-page-wrap"
          initial={{ opacity: 0, x: 90, rotateY: 5 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -90, rotateY: -5 }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={onDragEnd}
        >
          <div className="reader-paper">
            <Document
              file={pdfUrl}
              loading={
                <div className="reader-loading">Chargement des pages…</div>
              }
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setCurrentPage((p) => clamp(p, 1, numPages));
              }}
              onLoadError={() => setErr("Impossible de lire le PDF.")}
            >
              <Page
                pageNumber={currentPage}
                width={pageWidth}
                renderAnnotationLayer={false}
                renderTextLayer={true}
              />
            </Document>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
