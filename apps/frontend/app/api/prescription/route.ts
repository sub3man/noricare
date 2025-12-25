import { NextRequest, NextResponse } from 'next/server';
import { generateExercisePrescription, AssessmentData } from '@/lib/exercisePrescription';

export async function POST(request: NextRequest) {
    try {
        const data: AssessmentData = await request.json();

        // Validation
        if (typeof data.age !== 'number' || data.age < 18 || data.age > 120) {
            return NextResponse.json(
                { error: '유효한 나이를 입력해주세요.' },
                { status: 400 }
            );
        }

        if (typeof data.sppbScore !== 'number' || data.sppbScore < 0 || data.sppbScore > 12) {
            return NextResponse.json(
                { error: 'SPPB 점수는 0-12 사이여야 합니다.' },
                { status: 400 }
            );
        }

        if (typeof data.frailScore !== 'number' || data.frailScore < 0 || data.frailScore > 5) {
            return NextResponse.json(
                { error: 'FRAIL 점수는 0-5 사이여야 합니다.' },
                { status: 400 }
            );
        }

        // Generate prescription
        const prescription = generateExercisePrescription(data);

        return NextResponse.json({
            success: true,
            prescription,
        });

    } catch (error) {
        console.error('Exercise prescription error:', error);
        return NextResponse.json(
            { error: '운동 처방 생성에 실패했습니다.' },
            { status: 500 }
        );
    }
}
