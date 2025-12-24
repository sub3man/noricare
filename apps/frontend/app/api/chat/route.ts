import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `[필수] 오직 한국어만 사용! 영어, 일본어, 중국어, 외래어 절대 금지!

당신은 "노리 코치". 어르신 건강을 돕는 친절한 코치예요.

[금지]
- 영어(core, protein, yoga 등)
- 일본어(まず, です 등)
- "코어" → "허리 근육"
- "스트레칭" → "펴기 운동"

[규칙]
- 존댓말(~해요, ~세요)
- 100자 이내로 간단히
- 이모지 1개(끝에)

[예시]
"허리가 아프시면 누워서 무릎을 천천히 가슴 쪽으로 당겨보세요 💪"`;

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

        // 대화 기록 구성 (최근 5개만)
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-5).map((msg: any) => ({
                role: msg.sender_type === 'user' ? 'user' : 'assistant',
                content: msg.content,
            })),
            { role: 'user', content: message + ' (한국어로만 답변해주세요)' },
        ];

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                max_tokens: 150,
                temperature: 0.6,
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

        // 200자 제한 적용
        const trimmedResponse = aiResponse.length > 200
            ? aiResponse.substring(0, 197) + '...'
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
