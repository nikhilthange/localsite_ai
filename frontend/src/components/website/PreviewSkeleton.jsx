import { motion } from 'framer-motion';

function SkeletonBlock({ className }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`} />
  );
}

function SkeletonNavbar() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="w-8 h-8 rounded-full" />
        <SkeletonBlock className="w-28 h-4" />
      </div>
      <div className="flex items-center gap-4">
        <SkeletonBlock className="w-16 h-3 hidden sm:block" />
        <SkeletonBlock className="w-16 h-3 hidden sm:block" />
        <SkeletonBlock className="w-16 h-3 hidden sm:block" />
        <SkeletonBlock className="w-24 h-8 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonHero() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 px-6 py-16 lg:py-24">
      <div className="flex-1 space-y-6">
        <SkeletonBlock className="w-3/4 h-10 lg:h-14" />
        <SkeletonBlock className="w-full h-4" />
        <SkeletonBlock className="w-5/6 h-4" />
        <SkeletonBlock className="w-2/3 h-4" />
        <div className="flex gap-4 pt-4">
          <SkeletonBlock className="w-36 h-12 rounded-xl" />
          <SkeletonBlock className="w-36 h-12 rounded-xl" />
        </div>
      </div>
      <div className="flex-1">
        <SkeletonBlock className="aspect-video w-full rounded-2xl" />
      </div>
    </div>
  );
}

function SkeletonSection({ hasImage }) {
  return (
    <div className="px-6 py-12 lg:py-16">
      <div className="text-center mb-10">
        <SkeletonBlock className="w-48 h-8 mx-auto mb-3" />
        <SkeletonBlock className="w-96 max-w-full h-4 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            {hasImage && <SkeletonBlock className="w-full aspect-video rounded-xl" />}
            <SkeletonBlock className="w-3/4 h-5" />
            <SkeletonBlock className="w-full h-3" />
            <SkeletonBlock className="w-full h-3" />
            <SkeletonBlock className="w-2/3 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonTestimonials() {
  return (
    <div className="px-6 py-12 lg:py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="text-center mb-10">
        <SkeletonBlock className="w-40 h-8 mx-auto mb-3" />
        <SkeletonBlock className="w-56 max-w-full h-4 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <SkeletonBlock key={s} className="w-4 h-4 rounded" />
              ))}
            </div>
            <SkeletonBlock className="w-full h-3" />
            <SkeletonBlock className="w-full h-3" />
            <SkeletonBlock className="w-3/4 h-3" />
            <div className="flex items-center gap-3 pt-2">
              <SkeletonBlock className="w-10 h-10 rounded-full" />
              <div>
                <SkeletonBlock className="w-24 h-3 mb-1" />
                <SkeletonBlock className="w-16 h-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonFooter() {
  return (
    <div className="px-6 py-10 bg-slate-900 dark:bg-slate-950">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <SkeletonBlock className="w-20 h-4 bg-slate-700" />
            <SkeletonBlock className="w-full h-3 bg-slate-700" />
            <SkeletonBlock className="w-full h-3 bg-slate-700" />
            <SkeletonBlock className="w-2/3 h-3 bg-slate-700" />
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800 pt-6">
        <SkeletonBlock className="w-48 h-3 mx-auto bg-slate-700" />
      </div>
    </div>
  );
}

export default function PreviewSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-hidden">
      <SkeletonNavbar />
      <SkeletonHero />
      <SkeletonSection hasImage={false} />
      <SkeletonSection hasImage={true} />
      <SkeletonTestimonials />
      <div className="px-6 py-12">
        <div className="text-center mb-10">
          <SkeletonBlock className="w-32 h-8 mx-auto mb-3" />
          <SkeletonBlock className="w-48 max-w-full h-4 mx-auto" />
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <SkeletonBlock className="w-5 h-5 rounded mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="w-2/3 h-4" />
                <SkeletonBlock className="w-full h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <SkeletonFooter />
    </div>
  );
}