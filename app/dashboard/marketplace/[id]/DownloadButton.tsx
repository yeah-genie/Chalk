'use client';

import React, { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { downloadCurriculum } from '@/lib/actions/curriculum';
import { useRouter } from 'next/navigation';

interface Props {
    curriculumId: string;
    curriculumName: string;
}

export default function DownloadButton({ curriculumId, curriculumName }: Props) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDownload = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await downloadCurriculum(curriculumId);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                setError(result.error || 'Download failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <button
                disabled
                className="w-full bg-[#10b981] text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2"
            >
                <Check size={20} />
                Imported Successfully!
            </button>
        );
    }

    return (
        <div>
            <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#10b981]/90 disabled:bg-[#10b981]/50 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition"
            >
                {loading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Importing...
                    </>
                ) : (
                    <>
                        <Download size={20} />
                        Import to My Subjects
                    </>
                )}
            </button>

            {error && (
                <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
            )}
        </div>
    );
}
