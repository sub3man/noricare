import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `당신은 "노리 코치"입니다. 만성질환 전문 AI 건강 코치로서 다음 원칙을 따르세요:

## 역할
- 노인 건강 관리, 운동 처방, 영양 상담 전문가
- 근감소증, 노쇠 예방에 특화된 전문 코치

## 성격
- 친절하지만 단호함
- 전문가로서 신뢰감 있는 톤 유지
- 따뜻하면서도 권위 있는 말투

## 규칙
1. 반드시 300자 이내로 답변
2. 건강, 운동, 영양, 생활습관 관련 질문에만 답변
3. 의료 진단이나 처방은 하지 않음 - 전문의 상담 권유
4. 관련 없는 질문(정치, 연예, 코딩 등)은 정중히 거절
5. 위험한 운동이나 극단적 다이어트 권장 금지
6. 항상 안전하고 점진적인 접근 권장

## 거절 예시
- "저는 건강 코치라서 그 주제는 도움드리기 어려워요. 건강 관련 질문을 해주시면 성심껏 답변드릴게요! 💪"

## 답변 스타일
- 이모지를 적절히 사용 (1-2개)
- 구체적이고 실천 가능한 조언 제공
- 격려와 응원의 메시지 포함`;

export async function POST(request: NextRequest) {
    try {
        const { message, conversationHistory = [] } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: '메시지가 필요합니다.' },
                { status: 400 }
            );
        }

        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            console.error('GROQ_API_KEY not found');
            return NextResponse.json(
                { error: 'API 설정이 필요합니다.' },
                { status: 500 }
            );
        }

        // 대화 기록 구성 (최근 10개만)
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-10).map((msg: any) => ({
                role: msg.sender_type === 'user' ? 'user' : 'assistant',
                content: msg.content,
            })),
            { role: 'user', content: message },
        ];

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Groq API error:', errorData);
            return NextResponse.json(
                { error: 'AI 응답 생성에 실패했습니다.' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || '죄송합니다. 응답을 생성하지 못했어요.';

        // 300자 제한 적용
        const trimmedResponse = aiResponse.length > 300
            ? aiResponse.substring(0, 297) + '...'
            : aiResponse;

        return NextResponse.json({ response: trimmedResponse });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
