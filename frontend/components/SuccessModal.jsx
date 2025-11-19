"use client";

import { CheckCircle, ArrowRight, X } from "lucide-react";

export default function SuccessModal({ onCreateArticle, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-foreground text-center mb-3">
          Profile Created Successfully!
        </h2>

        <p className="text-muted-foreground text-center mb-8">
          Congratulations! Your author profile is now active. You can now start
          creating and publishing articles.
        </p>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={onCreateArticle}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Create Article Now
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors font-medium"
          >
            Continue Later
          </button>
        </div>
      </div>
    </div>
  );
}
