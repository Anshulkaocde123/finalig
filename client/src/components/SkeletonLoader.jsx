import React from 'react';

const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const MatchCardSkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-slate-200" />
        <div className="flex justify-between mb-3 pt-1">
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-between py-3">
            <div className="flex-1 text-center space-y-2">
                <Skeleton className="h-6 w-14 mx-auto rounded" />
                <Skeleton className="h-4 w-10 mx-auto rounded" />
            </div>
            <Skeleton className="h-9 w-9 rounded-full mx-3 flex-shrink-0" />
            <div className="flex-1 text-center space-y-2">
                <Skeleton className="h-6 w-14 mx-auto rounded" />
                <Skeleton className="h-4 w-10 mx-auto rounded" />
            </div>
        </div>
        <div className="flex justify-center gap-4 mt-3 pt-2.5 border-t border-slate-100">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
        </div>
    </div>
);

export const HighlightSkeleton = () => (
    <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-2 rounded" />
        <Skeleton className="h-3 w-full mb-1 rounded" />
        <Skeleton className="h-3 w-2/3 mb-4 rounded" />
        <Skeleton className="h-9 w-28 rounded-xl" />
    </div>
);

export const LeaderboardRowSkeleton = () => (
    <div className="flex items-center gap-4 p-4">
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
        </div>
        <Skeleton className="h-6 w-12 rounded" />
    </div>
);

export default Skeleton;
