import { NextResponse } from 'next/server';
import { autoAnalysisService } from '@/services/analysis';

export async function POST(request: Request) {
  try {
    const { recordingId } = await request.json();

    if (!recordingId) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      );
    }

    // Start analysis in background
    const analysis = await autoAnalysisService.analyzeRecording(recordingId);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
